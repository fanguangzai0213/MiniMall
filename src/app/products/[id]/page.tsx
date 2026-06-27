import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "./AddToCartButton";
import { getAuthUser } from "@/lib/auth";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = parseInt(id);

  if (isNaN(productId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900">商品不存在</h1>
          <Link href="/" className="mt-4 inline-block text-zinc-600 hover:text-zinc-900 underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const [product, user] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    }),
    getAuthUser(),
  ]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900">商品不存在</h1>
          <Link href="/" className="mt-4 inline-block text-zinc-600 hover:text-zinc-900 underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 面包屑 */}
      <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
        <Link href="/" className="hover:text-zinc-900">
          首页
        </Link>
        <span>/</span>
        <Link href={`/?category=${product.category.slug}`} className="hover:text-zinc-900">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-zinc-900">{product.name}</span>
      </nav>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* 商品图片 */}
          <div className="aspect-square bg-zinc-100 flex items-center justify-center p-8">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* 商品信息 */}
          <div className="p-8 flex flex-col">
            <span className="inline-block text-xs text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded w-fit">
              {product.category.name}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-zinc-900">
              {product.name}
            </h1>
            <p className="mt-4 text-3xl font-bold text-red-600">
              ¥{product.price}
            </p>
            <p className="mt-6 text-zinc-600 leading-relaxed">
              {product.description}
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-sm text-zinc-500">库存：</span>
              <span
                className={`text-sm font-medium ${
                  product.stock > 0 ? "text-green-600" : "text-red-500"
                }`}
              >
                {product.stock > 0 ? `${product.stock} 件` : "暂时缺货"}
              </span>
            </div>

            <div className="mt-auto pt-8">
              {user ? (
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  disabled={product.stock === 0}
                />
              ) : (
                <Link
                  href="/login"
                  className="block w-full py-3 px-6 rounded-lg text-base font-semibold text-center bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
                >
                  登录后购买
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
