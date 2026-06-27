"use client";

import { useState } from "react";

export function AddToCartButton({
  productId,
  productName,
  disabled,
}: {
  productId: number;
  productName: string;
  disabled: boolean;
}) {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full py-3 px-6 rounded-lg text-base font-semibold transition-all ${
        disabled
          ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
          : added
            ? "bg-green-600 text-white"
            : "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]"
      }`}
    >
      {disabled ? "暂时缺货" : added ? "已加入购物车 ✓" : "加入购物车"}
    </button>
  );
}
