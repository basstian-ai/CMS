import Link from "next/link";

import { createSermon } from "@/app/admin/sermons/actions";

export default function NewSermonPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Ny tale
          </p>
          <h2 className="text-2xl font-semibold text-slate-100">Opprett tale</h2>
        </div>
        <Link href="/admin/sermons" className="text-sm text-slate-400 hover:text-white">
          ← Tilbake
        </Link>
      </div>

      <form action={createSermon} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Tittel
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

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Taler
            <input
              name="preacher"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Bibelreferanse
            <input
              name="bible_ref"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-slate-200">
          Beskrivelse
          <textarea
            name="description"
            rows={4}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Publisert dato
            <input
              type="datetime-local"
              name="published_at"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Filnavn
            <input
              name="filename"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Audio path
            <input
              name="audio_path"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Spotify URL
            <input
              name="external_spotify_url"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Apple Podcasts URL
            <input
              name="external_apple_url"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Varighet (sekunder)
            <input
              type="number"
              name="duration_seconds"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-slate-200">
          Filstørrelse (bytes)
          <input
            type="number"
            name="file_size"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
          />
        </label>

        <button
          type="submit"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
        >
          Opprett tale
        </button>
      </form>
    </div>
  );
}
