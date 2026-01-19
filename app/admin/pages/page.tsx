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

export default async function PagesPage() {
  const supabase = createSupabaseServerClient();
  const { data: pages } = await supabase
    .from("pages")
    .select("id, slug, title, status, updated_at, published_at")
    .order("updated_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100">Sider</h2>
          <p className="text-sm text-slate-400">
            Administrer statiske sider og innholdssider.
          </p>
        </div>
        <Link
          href="/admin/pages/new"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
        >
          Ny side
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Tittel</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sist oppdatert</th>
              <th className="px-4 py-3">Publisert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {pages?.map((page) => (
              <tr key={page.id} className="bg-slate-950/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/pages/${page.id}`}
                    className="font-semibold text-slate-100 hover:text-white"
                  >
                    {page.title?.no ?? "Uten tittel"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-400">{page.slug}</td>
                <td className="px-4 py-3 text-slate-400">{page.status}</td>
                <td className="px-4 py-3 text-slate-400">
                  {formatDate(page.updated_at)}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {formatDate(page.published_at)}
                </td>
              </tr>
            ))}
            {!pages?.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-slate-400"
                >
                  Ingen sider ennå. Opprett din første side.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
