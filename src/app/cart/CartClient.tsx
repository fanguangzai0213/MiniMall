"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    stock: number;
    image: string;
  };
}

interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
}

export function CartClient() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();
    if (data.success) setCart(data.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  async function updateQuantity(itemId: number, quantity: number) {
    await fetch(`/api/cart/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    fetchCart();
    router.refresh();
  }

  async function removeItem(itemId: number) {
    await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    fetchCart();
    router.refresh();
  }

  if (loading) {
    return <p className="text-center text-zinc-500 py-10">加载中...</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500 mb-4">购物车是空的</p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
        >
          去逛逛
        </Link>
      </div>
    );
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="space-y-4">
      {cart.items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-xl border border-zinc-200 p-4 flex gap-4"
        >
          <Link href={`/products/${item.product.id}`} className="shrink-0">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-20 h-20 rounded-lg object-cover bg-zinc-100"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              href={`/products/${item.product.id}`}
              className="font-medium text-zinc-900 hover:text-zinc-600"
            >
              {item.product.name}
            </Link>
            <p className="text-red-600 font-bold mt-1">¥{item.product.price}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 rounded-lg border border-zinc-300 flex items-center justify-center hover:bg-zinc-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 rounded-lg border border-zinc-300 flex items-center justify-center hover:bg-zinc-50"
            >
              +
            </button>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="text-sm text-zinc-400 hover:text-red-500 shrink-0 self-center"
          >
            删除
          </button>
        </div>
      ))}

      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-zinc-600">合计</span>
          <span className="text-2xl font-bold text-red-600">¥{total.toFixed(2)}</span>
        </div>
        <button
          disabled
          className="w-full py-3 rounded-lg bg-zinc-900 text-white font-semibold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          结算（即将上线）
        </button>
      </div>
    </div>
  );
}
