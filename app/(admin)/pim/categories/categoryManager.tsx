'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { categorySchema } from '@/lib/validation';

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
};

const emptyForm = {
  name: '',
  slug: '',
  parentId: ''
};

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    try {
      const payload = categorySchema.parse({
        name: form.name,
        slug: form.slug,
        parentId: form.parentId || null
      });
      if (editing) {
        const res = await fetch(`/api/pim/categories/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to update category');
        const data = await res.json();
        setCategories((prev) => prev.map((cat) => (cat.id === data.id ? data : cat)));
      } else {
        const res = await fetch('/api/pim/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to create category');
        const data = await res.json();
        setCategories((prev) => [data, ...prev]);
      }
      setForm(emptyForm);
      setEditing(null);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/pim/categories/${id}`, { method: 'DELETE' });
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
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
        <label className="text-sm font-medium">Slug</label>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
        />
        <label className="text-sm font-medium">Parent ID</label>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          value={form.parentId}
          onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
        />
        <div className="md:col-span-2 flex gap-2">
          <Button onClick={submit}>{editing ? 'Update' : 'Create'} Category</Button>
          {editing && (
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Name</TH>
            <TH>Slug</TH>
            <TH>Parent</TH>
            <TH></TH>
          </TR>
        </THead>
        <TBody>
          {categories.map((category) => (
            <TR key={category.id}>
              <TD>{category.name}</TD>
              <TD>{category.slug}</TD>
              <TD>{category.parent_id ?? '-'}</TD>
              <TD className="space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(category);
                    setForm({
                      name: category.name,
                      slug: category.slug,
                      parentId: category.parent_id ?? ''
                    });
                  }}
                >
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(category.id)}>
                  Delete
                </Button>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}
