import { prisma } from "@/lib/prisma";
import { OrderTable } from "./OrderTable";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">订单管理</h1>
      <OrderTable orders={orders} />
    </div>
  );
}
