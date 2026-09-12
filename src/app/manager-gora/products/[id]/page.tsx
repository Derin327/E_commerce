"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getAdminProduct, updateProduct, getCategories } from "@/lib/actions/admin-crud";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "", slug: "", description: "", category_id: "",
    base_price: 0, compare_at_price: "", status: "draft", discount_badge: "", is_featured: false
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [prod, cats] = await Promise.all([
          getAdminProduct(params.id),
          getCategories()
        ]);
        setProduct(prod);
        setCategories(cats || []);
        setForm({
          name: prod.name, slug: prod.slug, description: prod.description || "",
          category_id: prod.category_id || "", base_price: prod.base_price,
          compare_at_price: prod.compare_at_price?.toString() || "",
          status: prod.status, discount_badge: prod.discount_badge || "",
          is_featured: prod.is_featured || false
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const payload = {
        ...form,
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null
      };
      const result = await updateProduct(params.id, payload as any);
      if (!result.success) {
        setError(result.error || "Failed to update product");
      } else {
        router.push("/manager-gora/products");
      }
    });
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  if (error && !product) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <Link href="/manager-gora/products" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Products
      </Link>
      <h1 className="text-2xl font-bold mb-6">Edit Product Basics</h1>
      
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border">
        <div>
          <label className="block text-sm font-semibold mb-1">Name</label>
          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Slug</label>
          <input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} className="w-full border p-2 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Base Price (Rs.)</label>
            <input type="number" step="0.01" value={form.base_price} onChange={e => setForm({...form, base_price: parseFloat(e.target.value)})} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Compare at Price (Rs.)</label>
            <input type="number" step="0.01" value={form.compare_at_price} onChange={e => setForm({...form, compare_at_price: e.target.value})} className="w-full border p-2 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Category</label>
            <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="w-full border p-2 rounded">
              <option value="">No Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full border p-2 rounded">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Discount Badge (e.g. -30%)</label>
          <input type="text" value={form.discount_badge} onChange={e => setForm({...form, discount_badge: e.target.value})} className="w-full border p-2 rounded" />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} className="w-4 h-4" />
          <span className="text-sm font-semibold">Featured Product</span>
        </label>
        
        <div className="pt-4 border-t flex justify-end">
          <button type="submit" disabled={isPending} className="bg-black text-white px-6 py-2 rounded font-semibold disabled:opacity-50">
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
