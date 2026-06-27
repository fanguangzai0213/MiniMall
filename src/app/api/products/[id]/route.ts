import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    return NextResponse.json(
      { success: false, error: "无效的商品 ID" },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json(
      { success: false, error: "商品不存在" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: product });
}
