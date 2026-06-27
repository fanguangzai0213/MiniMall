import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getDiscountRate } from "@/lib/tier";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    return NextResponse.json({ success: false, error: "无效的订单ID" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order || order.userId !== user.userId) {
    return NextResponse.json({ success: false, error: "订单不存在" }, { status: 404 });
  }

  if (order.status !== "PENDING") {
    return NextResponse.json({ success: false, error: "该订单无法支付" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: "PAID" },
    include: { items: { include: { product: true } } },
  });

  const newTotalSpent = order.user.totalSpent + order.total;
  const { tier } = getDiscountRate(newTotalSpent);
  await prisma.user.update({
    where: { id: order.userId },
    data: { totalSpent: newTotalSpent, tier },
  });

  return NextResponse.json({ success: true, data: updated });
}
