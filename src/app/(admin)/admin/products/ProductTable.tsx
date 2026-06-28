"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Category { id: number; name: string; slug: string; }
interface Product {
  id: number; name: string; description: string; price: number;
  stock: number; image: string; categoryId: number;
  category: Category; createdAt: string | Date;
}

export function ProductTable({
  products: initialProducts,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", categoryId: "" });
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", price: "", stock: "", categoryId: String(categories[0]?.id ?? "") });
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: String(p.price), stock: String(p.stock), categoryId: String(p.categoryId) });
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    const body = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      categoryId: parseInt(form.categoryId),
    };

    const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      router.refresh();
      setShowForm(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("确认删除？")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts(products.filter((p) => p.id !== id));
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={openCreate}
        className="mb-4 px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800"
      >
        新增商品
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-bold">{editing ? "编辑商品" : "新增商品"}</h2>
            <input className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm" placeholder="名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <textarea className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm" placeholder="描述" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-3">
              <input className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-sm" type="number" placeholder="价格" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <input className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-sm" type="number" placeholder="库存" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
            <select className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900">取消</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800 disabled:opacity-50">
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">名称</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-600">分类</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">价格</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">库存</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-zinc-500">{p.category.name}</td>
                <td className="px-4 py-3 text-right">¥{p.price}</td>
                <td className="px-4 py-3 text-right">{p.stock}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(p)} className="text-zinc-600 hover:text-zinc-900">编辑</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
