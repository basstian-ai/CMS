'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table';
import { pageCreateSchema } from '@/lib/validation';

type PageRow = {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  updated_at: string;
};

const emptyForm = {
  slug: '',
  title: '',
  status: 'draft',
  blocks: '[]',
  meta: '{}'
};

export function PageManager({ initialPages }: { initialPages: PageRow[] }) {
  const [pages, setPages] = useState<PageRow[]>(initialPages);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const submit = async () => {
    try {
      const parsed = pageCreateSchema.parse({
        slug: form.slug,
        title: form.title,
        status: form.status as 'draft' | 'published',
        blocks: JSON.parse(form.blocks || '[]'),
        meta: JSON.parse(form.meta || '{}')
      });
      if (editing) {
        const res = await fetch(`/api/content/pages/${editing}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed)
        });
        if (!res.ok) throw new Error('Failed to update');
        const data = await res.json();
        setPages((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      } else {
        const res = await fetch('/api/content/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed)
        });
        if (!res.ok) throw new Error('Failed to create');
        const data = await res.json();
        setPages((prev) => [data, ...prev]);
      }
      reset();
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onEdit = (page: PageRow) => {
    setEditing(page.slug);
    setForm({
      slug: page.slug,
      title: page.title,
      status: page.status,
      blocks: '[]',
      meta: '{}'
    });
  };

  const remove = async (slug: string) => {
    await fetch(`/api/content/pages/${slug}`, { method: 'DELETE' });
    setPages((prev) => prev.filter((p) => p.slug !== slug));
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Slug</label>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
        />
        <label className="text-sm font-medium">Title</label>
        <input
          className="rounded border border-slate-300 px-3 py-2"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <label className="text-sm font-medium">Status</label>
        <select
          className="rounded border border-slate-300 px-3 py-2"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <label className="text-sm font-medium">Blocks JSON</label>
        <textarea
          className="rounded border border-slate-300 px-3 py-2 font-mono"
          rows={4}
          value={form.blocks}
          onChange={(e) => setForm((f) => ({ ...f, blocks: e.target.value }))}
        />
        <label className="text-sm font-medium">Meta JSON</label>
        <textarea
          className="rounded border border-slate-300 px-3 py-2 font-mono"
          rows={3}
          value={form.meta}
          onChange={(e) => setForm((f) => ({ ...f, meta: e.target.value }))}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={submit}>{editing ? 'Update' : 'Create'} Page</Button>
          {editing && (
            <Button variant="ghost" onClick={reset}>
              Cancel
            </Button>
          )}
        </div>
      </div>
      <Table>
        <THead>
          <TR>
            <TH>Slug</TH>
            <TH>Title</TH>
            <TH>Status</TH>
            <TH>Updated</TH>
            <TH></TH>
          </TR>
        </THead>
        <TBody>
          {pages.map((page) => (
            <TR key={page.id}>
              <TD>{page.slug}</TD>
              <TD>{page.title}</TD>
              <TD>{page.status}</TD>
              <TD>{new Date(page.updated_at).toLocaleString()}</TD>
              <TD className="space-x-2">
                <Button size="sm" variant="ghost" onClick={() => onEdit(page)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(page.slug)}>
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
