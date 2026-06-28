"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Category { id: number; name: string; slug: string; productCount: number; }

export function CategoryTable({ categories: initial }: { categories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", slug: "" });
    setShowForm(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug });
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    const url = editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setCategories(categories.filter((c) => c.id !== id));
    router.refresh();
  }

  return (
    <div>
      <button onClick={openCreate} className="mb-4 px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm hover:bg-zinc-800">
        新增分类
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-bold">{editing ? "编辑分类" : "新增分类"}</h2>
            <input className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm" placeholder="名称" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm" placeholder="标识(slug)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-zinc-600">取消</button>
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
              <th className="text-left px-4 py-3 font-medium text-zinc-600">标识</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">商品数</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-zinc-500">{c.slug}</td>
                <td className="px-4 py-3 text-right">{c.productCount}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(c)} className="text-zinc-600 hover:text-zinc-900">编辑</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
