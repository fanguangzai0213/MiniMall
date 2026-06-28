import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const pageNum = parseInt(searchParams.get("page") || "1");
  const page = isNaN(pageNum) ? 1 : Math.max(1, pageNum);
  const pageSize = 9;

  const where: Record<string, unknown> = {};

  if (search) {
    where.name = { contains: search };
  }

  if (category) {
    where.category = { slug: category };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
