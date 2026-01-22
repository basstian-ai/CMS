import Link from "next/link";

import { createPage } from "@/app/admin/pages/actions";
import { MarkdownEditor } from "@/components/admin/markdown-editor";

export default function NewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Ny side
          </p>
          <h2 className="text-2xl font-semibold text-slate-100">Opprett side</h2>
        </div>
        <Link href="/admin/pages" className="text-sm text-slate-400 hover:text-white">
          ← Tilbake
        </Link>
      </div>

      <form action={createPage} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Tittel (NO)
            <input
              name="title"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Tittel (EN)
            <input
              name="title_en"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Slug
            <input
              name="slug"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <MarkdownEditor label="Innhold (NO)" name="content" rows={12} />
          <MarkdownEditor label="Innhold (EN)" name="content_en" rows={12} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Status
            <select
              name="status"
              defaultValue="draft"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            >
              <option value="draft">Kladd</option>
              <option value="published">Publisert</option>
              <option value="archived">Arkivert</option>
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Publisert dato
            <input
              type="datetime-local"
              name="published_at"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <button
          type="submit"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
        >
          Opprett side
        </button>
      </form>
    </div>
  );
}
