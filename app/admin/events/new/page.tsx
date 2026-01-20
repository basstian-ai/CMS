import Link from "next/link";

import { createEvent } from "@/app/admin/events/actions";
import { MarkdownEditor } from "@/components/admin/markdown-editor";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Nytt arrangement
          </p>
          <h2 className="text-2xl font-semibold text-slate-100">
            Opprett arrangement
          </h2>
        </div>
        <Link href="/admin/events" className="text-sm text-slate-400 hover:text-white">
          ← Tilbake
        </Link>
      </div>

      <form action={createEvent} className="space-y-6">
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
            Slug
            <input
              name="slug"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <MarkdownEditor label="Beskrivelse (Markdown)" name="description" rows={8} />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Starttidspunkt
            <input
              type="datetime-local"
              name="start_time"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Sluttidspunkt
            <input
              type="datetime-local"
              name="end_time"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Sted
            <input
              name="location"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
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
        </div>

        <label className="space-y-2 text-sm text-slate-200">
          Publisert dato
          <input
            type="datetime-local"
            name="published_at"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
          />
        </label>

        <button
          type="submit"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
        >
          Opprett arrangement
        </button>
      </form>
    </div>
  );
}
