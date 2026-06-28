import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  let cart = await prisma.cart.findUnique({
    where: { userId: user.userId },
    include: {
      items: { include: { product: true }, orderBy: { id: "asc" } },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: user.userId },
      include: { items: { include: { product: true } } },
    });
  }

  return NextResponse.json({ success: true, data: cart });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const { productId, quantity = 1 } = await request.json();
  if (!productId) {
    return NextResponse.json({ success: false, error: "缺少商品ID" }, { status: 400 });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return NextResponse.json({ success: false, error: "数量无效" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ success: false, error: "商品不存在" }, { status: 404 });
  }

  let cart = await prisma.cart.findUnique({ where: { userId: user.userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: user.userId } });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  const updated = await prisma.cart.findUnique({
    where: { userId: user.userId },
    include: {
      items: { include: { product: true }, orderBy: { id: "asc" } },
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
