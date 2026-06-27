import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getDiscountRate } from "@/lib/tier";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: orders });
}

export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const order = await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId: user.userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("EMPTY_CART");
    }

    for (const item of cart.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.quantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const originalTotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const dbUser = await tx.user.findUnique({
      where: { id: user.userId },
      select: { totalSpent: true },
    });
    if (!dbUser) throw new Error("USER_NOT_FOUND");

    const { rate } = getDiscountRate(dbUser.totalSpent);
    const total = Math.round(originalTotal * rate * 100) / 100;

    const newOrder = await tx.order.create({
      data: {
        userId: user.userId,
        originalTotal,
        discountRate: rate,
        total,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            price: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  }).catch((e) => {
    if (e.message === "EMPTY_CART") return { error: "购物车是空的", status: 400 };
    if (e.message === "INSUFFICIENT_STOCK") return { error: "库存不足", status: 400 };
    if (e.message === "USER_NOT_FOUND") return { error: "用户不存在", status: 404 };
    throw e;
  });

  if ("error" in order) {
    return NextResponse.json({ success: false, error: order.error }, { status: order.status });
  }

  return NextResponse.json({ success: true, data: order });
}
