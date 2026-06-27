import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "./LogoutButton";

export async function Header() {
  const user = await getAuthUser();

  let userName = "";
  let cartCount = 0;
  if (user) {
    const [dbUser, cart] = await Promise.all([
      prisma.user.findUnique({ where: { id: user.userId }, select: { name: true } }),
      prisma.cart.findUnique({
        where: { userId: user.userId },
        include: { items: true },
      }),
    ]);
    userName = dbUser?.name ?? "";
    cartCount = cart?.items.length ?? 0;
  }

  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-zinc-900">
          Mini Mall
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <span className="text-zinc-600">{userName}</span>
              <Link href="/cart" className="text-zinc-600 hover:text-zinc-900 relative">
                购物车
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
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
