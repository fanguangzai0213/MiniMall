import Link from "next/link";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 9;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const search = sp.search || "";
  const categorySlug = sp.category || "";
  const pageNum = parseInt(sp.page || "1");
  const page = isNaN(pageNum) ? 1 : Math.max(1, pageNum);

  // 获取分类列表
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { id: "asc" },
  });

  // 构建查询条件
  const where: Record<string, unknown> = {};
  if (search) {
    where.name = { contains: search };
  }
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 搜索框 */}
        <form className="mb-6">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="搜索商品..."
            className="w-full max-w-md px-4 py-2.5 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          />
          {categorySlug && (
            <input type="hidden" name="category" value={categorySlug} />
          )}
        </form>

        {/* 分类标签 */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !categorySlug
                ? "bg-zinc-900 text-white"
                : "bg-white text-zinc-600 border border-zinc-300 hover:bg-zinc-100"
            }`}
          >
            全部
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/?${new URLSearchParams({ search, category: c.slug }).toString()}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                categorySlug === c.slug
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-600 border border-zinc-300 hover:bg-zinc-100"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* 商品列表 */}
        {products.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-lg">没有找到相关商品</p>
            <p className="text-sm mt-1">换个关键词试试</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-lg hover:border-zinc-300 transition-all"
                >
                  <div className="aspect-square bg-zinc-100 flex items-center justify-center">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                      {p.category.name}
                    </span>
                    <h3 className="mt-2 font-semibold text-zinc-900 line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500 line-clamp-2">
                      {p.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-bold text-red-600">
                        ¥{p.price}
                      </span>
                      <span className="text-xs text-zinc-400">
                        库存 {p.stock}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/?${new URLSearchParams({ search, category: categorySlug, page: String(page - 1) }).toString()}`}
                    className="px-4 py-2 rounded-lg border border-zinc-300 bg-white text-sm hover:bg-zinc-50"
                  >
                    上一页
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-zinc-500">
                  第 {page} / {totalPages} 页
                </span>
                {page < totalPages && (
                  <Link
                    href={`/?${new URLSearchParams({ search, category: categorySlug, page: String(page + 1) }).toString()}`}
                    className="px-4 py-2 rounded-lg border border-zinc-300 bg-white text-sm hover:bg-zinc-50"
                  >
                    下一页
                  </Link>
                )}
              </div>
            )}
          </>
        )}
    </div>
  );
}
