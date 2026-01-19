import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function EventsPage() {
  const supabase = createSupabaseServerClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, slug, title, status, start_time, end_time")
    .order("start_time", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100">Arrangementer</h2>
          <p className="text-sm text-slate-400">
            Administrer kommende arrangementer og gudstjenester.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
        >
          Nytt arrangement
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Tittel</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Start</th>
              <th className="px-4 py-3">Slutt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {events?.map((event) => (
              <tr key={event.id} className="bg-slate-950/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="font-semibold text-slate-100 hover:text-white"
                  >
                    {event.title?.no ?? "Uten tittel"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-400">{event.slug}</td>
                <td className="px-4 py-3 text-slate-400">{event.status}</td>
                <td className="px-4 py-3 text-slate-400">
                  {formatDate(event.start_time)}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {formatDate(event.end_time)}
                </td>
              </tr>
            ))}
            {!events?.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-slate-400"
                >
                  Ingen arrangementer ennå. Opprett ditt første arrangement.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
