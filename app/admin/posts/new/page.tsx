import Link from "next/link";

import { createPost } from "@/app/admin/posts/actions";
import { MarkdownEditor } from "@/components/admin/markdown-editor";

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Nytt innlegg
          </p>
          <h2 className="text-2xl font-semibold text-slate-100">
            Opprett nytt innlegg
          </h2>
        </div>
        <Link href="/admin/posts" className="text-sm text-slate-400 hover:text-white">
          ← Tilbake
        </Link>
      </div>

      <form action={createPost} className="space-y-6">
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

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Sammendrag (NO)
            <textarea
              name="excerpt"
              rows={3}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Sammendrag (EN)
            <textarea
              name="excerpt_en"
              rows={3}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <MarkdownEditor
            label="Innhold (NO)"
            name="content"
            recordId="post-new"
            rows={12}
          />
          <MarkdownEditor
            label="Innhold (EN)"
            name="content_en"
            recordId="post-new"
            rows={12}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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
          <label className="space-y-2 text-sm text-slate-200">
            Cover image path
            <input
              name="cover_image_path"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <button
          type="submit"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
        >
          Opprett innlegg
        </button>
      </form>
    </div>
  );
}
