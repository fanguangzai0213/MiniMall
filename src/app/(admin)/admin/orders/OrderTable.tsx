"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";

const STATUS_MAP: Record<string, string> = {
  PENDING: "待支付", PAID: "已支付", SHIPPED: "已发货", COMPLETED: "已完成", CANCELLED: "已取消",
};
const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700", PAID: "bg-green-100 text-green-700",
  SHIPPED: "bg-blue-100 text-blue-700", COMPLETED: "bg-zinc-100 text-zinc-600", CANCELLED: "bg-red-100 text-red-700",
};
const NEXT_STATUS: Record<string, string> = {
  PENDING: "PAID", PAID: "SHIPPED", SHIPPED: "COMPLETED",
};
const STATUS_ACTIONS: Record<string, string> = {
  PENDING: "标记支付", PAID: "标记发货", SHIPPED: "标记完成",
};

interface OrderItem { id: number; product: { name: string }; price: number; quantity: number; }
interface Order {
  id: number; originalTotal: number; discountRate: number; total: number;
  status: string; createdAt: string | Date; items: OrderItem[];
  user: { name: string; email: string };
}

export function OrderTable({ orders: initialOrders }: { orders: Order[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  async function updateStatus(orderId: number, status: string) {
    setUpdating(orderId);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setUpdating(null);
    if (data.success) {
      setOrders(orders.map((o) => (o.id === orderId ? data.data : o)));
      router.refresh();
    }
  }

  async function cancelOrder(orderId: number) {
    if (!confirm("确认取消该订单？")) return;
    await updateStatus(orderId, "CANCELLED");
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 border-b border-zinc-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-zinc-600">订单号</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-600">用户</th>
            <th className="text-right px-4 py-3 font-medium text-zinc-600">金额</th>
            <th className="text-center px-4 py-3 font-medium text-zinc-600">状态</th>
            <th className="text-right px-4 py-3 font-medium text-zinc-600">操作</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <Fragment key={o.id}>
              <tr key={o.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3">
                  <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="text-zinc-900 font-medium hover:underline">
                    #{o.id}
                  </button>
                </td>
                <td className="px-4 py-3 text-zinc-500">{o.user.name}</td>
                <td className="px-4 py-3 text-right">
                  {o.discountRate < 1 && <span className="text-xs text-zinc-400 line-through mr-1">¥{o.originalTotal}</span>}
                  <span className="font-medium">¥{o.total.toFixed(2)}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CLASS[o.status]}`}>{STATUS_MAP[o.status]}</span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  {STATUS_ACTIONS[o.status] && (
                    <button onClick={() => updateStatus(o.id, NEXT_STATUS[o.status])} disabled={updating === o.id}
                      className="text-blue-600 hover:text-blue-800 disabled:opacity-50">
                      {updating === o.id ? "处理中..." : STATUS_ACTIONS[o.status]}
                    </button>
                  )}
                  {(o.status === "PENDING" || o.status === "PAID") && (
                    <button onClick={() => cancelOrder(o.id)} className="text-red-500 hover:text-red-700">取消</button>
                  )}
                </td>
              </tr>
              {expanded === o.id && (
                <tr key={`${o.id}-detail`} className="bg-zinc-50">
                  <td colSpan={5} className="px-4 py-3">
                    <div className="space-y-2">
                      <p className="text-xs text-zinc-500">下单时间：{new Date(o.createdAt).toLocaleString("zh-CN")}</p>
                      <p className="text-xs text-zinc-500">用户邮箱：{o.user.email}</p>
                      {o.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.product.name} × {item.quantity}</span>
                          <span className="text-zinc-500">¥{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
