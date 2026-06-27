"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.error);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          邮箱
        </label>
        <input
          type="email"
          name="email"
          required
          className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          placeholder="请输入邮箱"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          密码
        </label>
        <input
          type="password"
          name="password"
          required
          minLength={6}
          className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          placeholder="请输入密码"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "登录中..." : "登录"}
      </button>
      <p className="text-center text-sm text-zinc-500">
        还没有账号？
        <Link href="/register" className="text-zinc-900 font-medium hover:underline ml-1">
          立即注册
        </Link>
      </p>
    </form>
  );
}
