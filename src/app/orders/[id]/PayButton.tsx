"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PayButton({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setError("");
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}/pay`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      router.refresh();
    } else {
      setError(data.error || "支付失败，请重试");
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-3">
          {error}
        </div>
      )}
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "处理中..." : "去支付"}
      </button>
    </div>
  );
}
