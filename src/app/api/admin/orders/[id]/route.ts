import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getDiscountRate } from "@/lib/tier";

const VALID_STATUSES = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "无权限访问" }, { status: 403 });
  }

  const { id } = await params;
  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    return NextResponse.json({ success: false, error: "无效的订单ID" }, { status: 400 });
  }

  const { status } = await request.json();
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ success: false, error: "无效的订单状态" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { select: { totalSpent: true } } },
  });

  if (!order) {
    return NextResponse.json({ success: false, error: "订单不存在" }, { status: 404 });
  }

  if (order.status === "CANCELLED" || order.status === "COMPLETED") {
    return NextResponse.json({ success: false, error: "该订单状态不可修改" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: { include: { product: true } } },
  });

  // 仅 PENDING→PAID 累加消费
  if (status === "PAID" && order.status === "PENDING") {
    const newTotalSpent = order.user.totalSpent + order.total;
    const { tier } = getDiscountRate(newTotalSpent);
    await prisma.user.update({
      where: { id: order.userId },
      data: { totalSpent: newTotalSpent, tier },
    });
  }

  return NextResponse.json({ success: true, data: updated });
}
