import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { CartClient } from "./CartClient";

export default async function CartPage() {
  const user = await getAuthUser();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">购物车</h1>
      {!user ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 mb-4">请先登录后查看购物车</p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
          >
            去登录
          </Link>
        </div>
      ) : (
        <CartClient />
      )}
    </div>
  );
}
