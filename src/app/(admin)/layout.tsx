import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const links = [
    { href: "/admin/products", label: "商品管理" },
    { href: "/admin/orders", label: "订单管理" },
    { href: "/admin/categories", label: "分类管理" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside className="w-48 bg-zinc-900 text-white shrink-0">
        <nav className="p-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-zinc-50 p-6">{children}</main>
    </div>
  );
}
