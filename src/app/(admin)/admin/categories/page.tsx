import { prisma } from "@/lib/prisma";
import { CategoryTable } from "./CategoryTable";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { id: "asc" },
  });

  const data = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c._count.products,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">分类管理</h1>
      <CategoryTable categories={data} />
    </div>
  );
}
