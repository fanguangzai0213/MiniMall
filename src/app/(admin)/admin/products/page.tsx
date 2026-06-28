import { prisma } from "@/lib/prisma";
import { ProductTable } from "./ProductTable";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { id: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">商品管理</h1>
      <ProductTable products={products} categories={categories} />
    </div>
  );
}
