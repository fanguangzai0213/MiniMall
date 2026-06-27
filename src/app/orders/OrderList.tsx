"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const STATUS_MAP: Record<string, string> = {
  PENDING: "待支付",
  PAID: "已支付",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-zinc-100 text-zinc-600",
  CANCELLED: "bg-red-100 text-red-700",
};

interface OrderItem {
  id: number;
  productId: number;
  price: number;
  quantity: number;
  product: {
    name: string;
    image: string;
  };
}

interface Order {
  id: number;
  originalTotal: number;
  discountRate: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    if (data.success) setOrders(data.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return <p className="text-center text-zinc-500 py-10">加载中...</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500 mb-4">暂无订单</p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
        >
          去逛逛
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/orders/${order.id}`}
          className="block bg-white rounded-xl border border-zinc-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-500">
              订单号 #{order.id}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CLASS[order.status]}`}
            >
              {STATUS_MAP[order.status]}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {order.items.slice(0, 4).map((item) => (
              <img
                key={item.id}
                src={item.product.image}
                alt={item.product.name}
                className="w-16 h-16 rounded-lg object-cover bg-zinc-100 shrink-0"
              />
            ))}
            {order.items.length > 4 && (
              <div className="w-16 h-16 rounded-lg bg-zinc-100 flex items-center justify-center text-sm text-zinc-400 shrink-0">
                +{order.items.length - 4}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-zinc-500">
              {order.items.length} 件商品
            </span>
            <div className="text-right">
              {order.discountRate < 1 && (
                <span className="text-xs text-zinc-400 line-through mr-2">
                  ¥{order.originalTotal}
                </span>
              )}
              <span className="text-lg font-bold text-red-600">
                ¥{order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
