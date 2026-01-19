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

export default async function SermonsPage() {
  const supabase = createSupabaseServerClient();
  const { data: sermons } = await supabase
    .from("sermons")
    .select("id, slug, title, preacher, published_at")
    .order("published_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100">Taler</h2>
          <p className="text-sm text-slate-400">
            Publiser nye taler og administrer podcast-innhold.
          </p>
        </div>
        <Link
          href="/admin/sermons/new"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
        >
          Ny tale
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Tittel</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Taler</th>
              <th className="px-4 py-3">Publisert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sermons?.map((sermon) => (
              <tr key={sermon.id} className="bg-slate-950/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/sermons/${sermon.id}`}
                    className="font-semibold text-slate-100 hover:text-white"
                  >
                    {sermon.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-400">{sermon.slug}</td>
                <td className="px-4 py-3 text-slate-400">
                  {sermon.preacher ?? "-"}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {formatDate(sermon.published_at)}
                </td>
              </tr>
            ))}
            {!sermons?.length && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-slate-400"
                >
                  Ingen taler ennå. Opprett din første tale.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
