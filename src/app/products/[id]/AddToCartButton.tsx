"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddToCartButton({
  productId,
  productName,
  disabled,
}: {
  productId: number;
  productName: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    setLoading(false);

    const data = await res.json();
    if (!data.success) {
      if (data.error === "请先登录") {
        router.push("/login");
      }
      return;
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`w-full py-3 px-6 rounded-lg text-base font-semibold transition-all ${
        disabled
          ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
          : added
            ? "bg-green-600 text-white"
            : "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]"
      }`}
    >
      {disabled ? "暂时缺货" : loading ? "加入中..." : added ? "已加入购物车 ✓" : "加入购物车"}
    </button>
  );
}
