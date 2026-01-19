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

export default async function PostsPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const supabase = createSupabaseServerClient();
  const query = searchParams?.query?.trim();
  let request = supabase
    .from("posts")
    .select("id, slug, title, status, updated_at, published_at")
    .order("updated_at", { ascending: false });
  if (query) {
    request = request.or(
      `slug.ilike.%${query}%,title->>no.ilike.%${query}%`
    );
  }
  const { data: posts } = await request;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-100">Innlegg</h2>
          <p className="text-sm text-slate-400">
            Opprett, rediger og publiser nyhetsinnlegg.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
        >
          Nytt innlegg
        </Link>
      </div>

      <form className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-200">
          Søk
          <input
            name="query"
            defaultValue={query}
            placeholder="Søk i tittel eller slug"
            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-100"
          />
        </label>
        <button
          type="submit"
          className="mt-6 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200"
        >
          Filtrer
        </button>
      </form>

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
            {posts?.map((post) => (
              <tr key={post.id} className="bg-slate-950/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="font-semibold text-slate-100 hover:text-white"
                  >
                    {post.title?.no ?? "Uten tittel"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-400">{post.slug}</td>
                <td className="px-4 py-3 text-slate-400">{post.status}</td>
                <td className="px-4 py-3 text-slate-400">
                  {formatDate(post.updated_at)}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {formatDate(post.published_at)}
                </td>
              </tr>
            ))}
            {!posts?.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-slate-400"
                >
                  Ingen innlegg ennå. Opprett ditt første innlegg.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
