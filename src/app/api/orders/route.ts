import { NextRequest, NextResponse } from "next/server";
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
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: orders });
}

export async function POST() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: user.userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ success: false, error: "购物车是空的" }, { status: 400 });
  }

  // 检查库存
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      return NextResponse.json(
        { success: false, error: `「${item.product.name}」库存不足` },
        { status: 400 }
      );
    }
  }

  const originalTotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
  const { rate } = getDiscountRate(dbUser!.totalSpent);
  const total = Math.round(originalTotal * rate * 100) / 100;

  const order = await prisma.order.create({
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
    include: {
      items: { include: { product: true } },
    },
  });

  // 扣减库存
  for (const item of cart.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  // 清空购物车
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  return NextResponse.json({ success: true, data: order });
}
