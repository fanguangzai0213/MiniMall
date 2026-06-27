import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDiscountRate } from "@/lib/tier";

const VALID_STATUSES = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    return NextResponse.json({ success: false, error: "无效的订单ID" }, { status: 400 });
  }

  const { status } = await request.json();
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { success: false, error: "无效的订单状态" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order) {
    return NextResponse.json({ success: false, error: "订单不存在" }, { status: 404 });
  }

  // 已取消/已完成订单不可修改
  if (order.status === "CANCELLED" || order.status === "COMPLETED") {
    return NextResponse.json(
      { success: false, error: "该订单状态不可修改" },
      { status: 400 }
    );
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      items: { include: { product: true } },
    },
  });

  // 支付完成：仅 PENDING→PAID 累加消费金额
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
