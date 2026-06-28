import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "无权限访问" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const pageNum = parseInt(searchParams.get("page") || "1");
  const page = isNaN(pageNum) ? 1 : Math.max(1, pageNum);
  const pageSize = 12;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count(),
  ]);

  return NextResponse.json({
    success: true,
    data: { products, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "无权限访问" }, { status: 403 });
  }

  const { name, description, price, stock, categoryId } = await request.json();

  if (!name || price == null || !categoryId) {
    return NextResponse.json({ success: false, error: "请填写完整信息" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      description: description || "",
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      categoryId: parseInt(categoryId),
    },
    include: { category: true },
  });

  return NextResponse.json({ success: true, data: product });
}
