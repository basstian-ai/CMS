import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteEvent, updateEvent } from "@/app/admin/events/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatDateTime(value: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (input: number) => input.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: event } = await supabase
    .from("events")
    .select(
      "id, slug, title, description_md, status, start_time, end_time, location, published_at"
    )
    .eq("id", params.id)
    .single();

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Arrangement
          </p>
          <h2 className="text-2xl font-semibold text-slate-100">
            {event.title?.no ?? "Uten tittel"}
          </h2>
        </div>
        <Link href="/admin/events" className="text-sm text-slate-400 hover:text-white">
          ← Tilbake
        </Link>
      </div>

      <form action={updateEvent.bind(null, event.id)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Tittel (NO)
            <input
              name="title"
              required
              defaultValue={event.title?.no ?? ""}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Slug
            <input
              name="slug"
              required
              defaultValue={event.slug}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-slate-200">
          Beskrivelse (Markdown)
          <textarea
            name="description"
            rows={6}
            defaultValue={event.description_md?.no ?? ""}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Starttidspunkt
            <input
              type="datetime-local"
              name="start_time"
              required
              defaultValue={formatDateTime(event.start_time)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Sluttidspunkt
            <input
              type="datetime-local"
              name="end_time"
              defaultValue={formatDateTime(event.end_time)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Sted
            <input
              name="location"
              defaultValue={event.location ?? ""}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Status
            <select
              name="status"
              defaultValue={event.status}
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
            defaultValue={formatDateTime(event.published_at)}
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
            formAction={deleteEvent.bind(null, event.id)}
            className="rounded-full border border-rose-500/60 px-5 py-2 text-sm font-semibold text-rose-200"
          >
            Slett arrangement
          </button>
        </div>
      </form>
    </div>
  );
}
