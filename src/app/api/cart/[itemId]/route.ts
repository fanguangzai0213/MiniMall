import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const { itemId } = await params;
  const { quantity } = await request.json();

  const item = await prisma.cartItem.findUnique({
    where: { id: parseInt(itemId) },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== user.userId) {
    return NextResponse.json({ success: false, error: "购物车项不存在" }, { status: 404 });
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: user.userId },
    include: {
      items: {
        include: { product: true },
        orderBy: { id: "asc" },
      },
    },
  });

  return NextResponse.json({ success: true, data: cart });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const { itemId } = await params;

  const item = await prisma.cartItem.findUnique({
    where: { id: parseInt(itemId) },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== user.userId) {
    return NextResponse.json({ success: false, error: "购物车项不存在" }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: item.id } });

  const cart = await prisma.cart.findUnique({
    where: { userId: user.userId },
    include: {
      items: {
        include: { product: true },
        orderBy: { id: "asc" },
      },
    },
  });

  return NextResponse.json({ success: true, data: cart });
}
