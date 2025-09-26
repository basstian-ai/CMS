'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { productSchema } from '@/lib/validation';

type ProductRow = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  brand: string | null;
  default_image_url: string | null;
  created_at: string;
};

type Category = { id: string; name: string; slug: string };

const emptyForm = {
  name: '',
  sku: '',
  description: '',
  brand: '',
  image: '',
  categoryId: '',
  variantSku: '',
  variantName: '',
  price: '',
  stock: ''
};

export function ProductManager({
  initialProducts,
  categories
}: {
  initialProducts: ProductRow[];
  categories: Category[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    try {
      const priceValue = Number(form.price);
      if (!Number.isFinite(priceValue) || priceValue <= 0) {
        throw new Error('Price must be greater than zero');
      }
      const priceCents = Math.round(priceValue * 100);
      const stockQty = Number(form.stock) || 0;
      const payload = {
        name: form.name,
        sku: form.sku,
        description: form.description || undefined,
        brand: form.brand || undefined,
        defaultImageUrl: form.image || undefined,
        attributes: {},
        categories: form.categoryId ? [form.categoryId] : [],
        variants: [
          {
            sku: form.variantSku || `${form.sku}-VAR`,
            name: form.variantName || form.name,
            priceCents,
            currency: 'NOK',
            stockQty
          }
        ]
      };
      productSchema.parse(payload);
      const res = await fetch('/api/pim/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to create product');
      const data = await res.json();
      setProducts((prev) => [
        {
          id: data.id,
          name: form.name,
          sku: form.sku,
          description: form.description,
          brand: form.brand,
          default_image_url: form.image,
          created_at: new Date().toISOString()
        },
        ...prev
      ]);
      setForm(emptyForm);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-2">
        <label className="text-sm font-medium">Name</label>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <label className="text-sm font-medium">SKU</label>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          value={form.sku}
          onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
        />
        <label className="text-sm font-medium">Description</label>
        <textarea
          className="rounded border border-slate-300 px-3 py-2"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <label className="text-sm font-medium">Brand</label>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          value={form.brand}
          onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
        />
        <label className="text-sm font-medium">Image URL</label>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          value={form.image}
          onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
        />
        <label className="text-sm font-medium">Category</label>
        <select
          className="rounded border border-slate-300 px-3 py-2"
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
        >
          <option value="">Unassigned</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <label className="text-sm font-medium">Variant SKU</label>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          value={form.variantSku}
          onChange={(e) => setForm((f) => ({ ...f, variantSku: e.target.value }))}
        />
        <label className="text-sm font-medium">Variant Name</label>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          value={form.variantName}
          onChange={(e) => setForm((f) => ({ ...f, variantName: e.target.value }))}
        />
        <label className="text-sm font-medium">Price (NOK)</label>
        <input
          type="number"
          className="rounded border border-slate-300 px-3 py-2"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
        />
        <label className="text-sm font-medium">Stock</label>
        <input
          type="number"
          className="rounded border border-slate-300 px-3 py-2"
          value={form.stock}
          onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
        />
        <div className="md:col-span-2 flex gap-2">
          <Button onClick={submit}>Create Product</Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>SKU</TH>
            <TH>Name</TH>
            <TH>Brand</TH>
            <TH>Created</TH>
          </TR>
        </THead>
        <TBody>
          {products.map((product) => (
            <TR key={product.id}>
              <TD>{product.sku}</TD>
              <TD>{product.name}</TD>
              <TD>{product.brand}</TD>
              <TD>{new Date(product.created_at).toLocaleDateString()}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
