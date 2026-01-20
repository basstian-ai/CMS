import { uploadMedia } from "@/app/admin/media/actions";
import { escapePostgrestText } from "@/lib/supabase/postgrest";
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

export default async function MediaPage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const supabase = createSupabaseServerClient();
  const query = searchParams?.query?.trim();
  const escapedQuery = query ? escapePostgrestText(query) : null;
  let request = supabase
    .from("media")
    .select("id, bucket, path, alt, caption, updated_at")
    .order("updated_at", { ascending: false });
  if (escapedQuery) {
    request = request.or(
      `path.ilike."%${escapedQuery}%",bucket.ilike."%${escapedQuery}%"`
    );
  }
  const { data: media } = await request;

  const mediaWithUrls =
    media?.map((item) => {
      const { data } = supabase.storage.from(item.bucket).getPublicUrl(item.path);
      return { ...item, publicUrl: data.publicUrl };
    }) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-100">Media</h2>
        <p className="text-sm text-slate-400">
          Last opp bilder eller MP3-filer, og registrer metadata for innholdet.
        </p>
      </div>

      <form
        action={uploadMedia}
        className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-5"
        encType="multipart/form-data"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Fil
            <input
              type="file"
              name="file"
              required
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm text-slate-200 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-900"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Bucket
            <select
              name="bucket"
              defaultValue="images"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            >
              <option value="images">images (bilder)</option>
              <option value="podcasts">podcasts (MP3)</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Lagringssti (valgfri)
            <input
              name="path"
              placeholder="f.eks. nyheter/2024/cover.jpg"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Alt-tekst (NO)
            <input
              name="alt"
              placeholder="Beskriv bildet"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-slate-200">
          Bildetekst (NO)
          <input
            name="caption"
            placeholder="Valgfri bildetekst"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
          />
        </label>

        <button
          type="submit"
          className="w-fit rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
        >
          Last opp
        </button>
      </form>

      <form className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-200">
          Søk
          <input
            name="query"
            defaultValue={query}
            placeholder="Søk i bucket eller sti"
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
              <th className="px-4 py-3">Fil</th>
              <th className="px-4 py-3">Bucket</th>
              <th className="px-4 py-3">Alt-tekst</th>
              <th className="px-4 py-3">Sist oppdatert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {mediaWithUrls.map((item) => (
              <tr key={item.id} className="bg-slate-950/40">
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-100">{item.path}</p>
                    <a
                      href={item.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-400 hover:text-brand-300"
                    >
                      Åpne fil
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-400">{item.bucket}</td>
                <td className="px-4 py-3 text-slate-400">
                  {item.alt?.no || "-"}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {formatDate(item.updated_at)}
                </td>
              </tr>
            ))}
            {!mediaWithUrls.length && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-slate-400"
                >
                  Ingen mediafiler ennå. Last opp ditt første bilde eller MP3.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
