import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export async function Header() {
  const user = await getAuthUser();

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-zinc-900">
          Mini Mall
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <span className="text-zinc-600">
                {user.name}
              </span>
              <Link href="/cart" className="text-zinc-600 hover:text-zinc-900">
                购物车
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/cart" className="text-zinc-600 hover:text-zinc-900">
                购物车
              </Link>
              <Link href="/login" className="text-zinc-600 hover:text-zinc-900">
                登录
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
              >
                注册
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
