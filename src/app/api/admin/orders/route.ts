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

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count(),
  ]);

  return NextResponse.json({
    success: true,
    data: { orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  });
}
