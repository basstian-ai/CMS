import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteSermon, updateSermon } from "@/app/admin/sermons/actions";
import { SlugField } from "@/components/admin/slug-field";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatDateTime(value: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 16);
}

export default async function SermonDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: sermon } = await supabase
    .from("sermons")
    .select(
      "id, slug, title, preacher, bible_ref, description, published_at, filename, audio_path, external_spotify_url, external_apple_url, duration_seconds, file_size"
    )
    .eq("id", params.id)
    .single();

  if (!sermon) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Tale
          </p>
          <h2 className="text-2xl font-semibold text-slate-100">
            {sermon.title}
          </h2>
        </div>
        <Link href="/admin/sermons" className="text-sm text-slate-400 hover:text-white">
          ← Tilbake
        </Link>
      </div>

      <form action={updateSermon.bind(null, sermon.id)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Tittel
            <input
              name="title"
              required
              defaultValue={sermon.title}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <SlugField
            initialSlug={sermon.slug}
            slugName="slug"
            titleInputName="title"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Taler
            <input
              name="preacher"
              defaultValue={sermon.preacher ?? ""}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Bibelreferanse
            <input
              name="bible_ref"
              defaultValue={sermon.bible_ref ?? ""}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-slate-200">
          Beskrivelse
          <textarea
            name="description"
            rows={4}
            defaultValue={sermon.description ?? ""}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Publisert dato
            <input
              type="datetime-local"
              name="published_at"
              defaultValue={formatDateTime(sermon.published_at)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Filnavn
            <input
              name="filename"
              defaultValue={sermon.filename ?? ""}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Audio path
            <input
              name="audio_path"
              defaultValue={sermon.audio_path ?? ""}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Spotify URL
            <input
              name="external_spotify_url"
              defaultValue={sermon.external_spotify_url ?? ""}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Apple Podcasts URL
            <input
              name="external_apple_url"
              defaultValue={sermon.external_apple_url ?? ""}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Varighet (sekunder)
            <input
              type="number"
              name="duration_seconds"
              defaultValue={sermon.duration_seconds ?? ""}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-slate-200">
          Filstørrelse (bytes)
          <input
            type="number"
            name="file_size"
            defaultValue={sermon.file_size ?? ""}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
          >
            Lagre endringer
          </button>
          <button
            type="submit"
            formAction={deleteSermon.bind(null, sermon.id)}
            className="rounded-full border border-rose-500/60 px-5 py-2 text-sm font-semibold text-rose-200"
          >
            Slett tale
          </button>
        </div>
      </form>
    </div>
  );
}
