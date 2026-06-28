import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "无权限访问" }, { status: 403 });
  }

  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) {
    return NextResponse.json({ success: false, error: "无效的商品ID" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ success: false, error: "商品不存在" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: product });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "无权限访问" }, { status: 403 });
  }

  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) {
    return NextResponse.json({ success: false, error: "无效的商品ID" }, { status: 400 });
  }

  const { name, description, price, stock, categoryId } = await request.json();

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(stock !== undefined && { stock: parseInt(stock) }),
      ...(categoryId !== undefined && { categoryId: parseInt(categoryId) }),
    },
    include: { category: true },
  });

  return NextResponse.json({ success: true, data: product });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "无权限访问" }, { status: 403 });
  }

  const { id } = await params;
  const productId = parseInt(id);
  if (isNaN(productId)) {
    return NextResponse.json({ success: false, error: "无效的商品ID" }, { status: 400 });
  }

  await prisma.product.delete({ where: { id: productId } });

  return NextResponse.json({ success: true });
}
