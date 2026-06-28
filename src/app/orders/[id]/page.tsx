import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { PayButton } from "./PayButton";

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

export default async function OrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500 mb-4">请先登录</p>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
        >
          去登录
        </Link>
      </div>
    );
  }

  const { id } = await params;
  const orderId = parseInt(id);
  if (isNaN(orderId)) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-zinc-900">订单不存在</h1>
        <Link href="/orders" className="mt-4 inline-block text-zinc-600 hover:text-zinc-900 underline">
          返回订单列表
        </Link>
      </div>
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      user: true,
    },
  });

  if (!order || order.userId !== user.userId) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-zinc-900">订单不存在</h1>
        <Link href="/orders" className="mt-4 inline-block text-zinc-600 hover:text-zinc-900 underline">
          返回订单列表
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/orders" className="text-sm text-zinc-500 hover:text-zinc-900 mb-4 inline-block">
        ← 返回订单列表
      </Link>

      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">订单 #{order.id}</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {new Date(order.createdAt).toLocaleString("zh-CN")}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_CLASS[order.status]}`}
          >
            {STATUS_MAP[order.status]}
          </span>
        </div>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 items-center">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-16 h-16 rounded-lg object-cover bg-zinc-100"
              />
              <div className="flex-1">
                <Link
                  href={`/products/${item.productId}`}
                  className="font-medium text-zinc-900 hover:text-zinc-600"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-zinc-500">
                  ¥{item.price} × {item.quantity}
                </p>
              </div>
              <span className="font-medium">
                ¥{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-zinc-600">
            <span>商品总额</span>
            <span>¥{order.originalTotal.toFixed(2)}</span>
          </div>
          {order.discountRate < 1 && (
            <div className="flex justify-between text-green-600">
              <span>会员折扣（{Math.round((1 - order.discountRate) * 100)}% off）</span>
              <span>-¥{(order.originalTotal - order.total).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold text-zinc-900 pt-2 border-t border-zinc-200">
            <span>实付</span>
            <span className="text-red-600">¥{order.total.toFixed(2)}</span>
          </div>
        </div>

        {order.status === "PENDING" && (
          <div className="mt-6">
            <PayButton orderId={order.id} />
          </div>
        )}
      </div>
    </div>
  );
}
