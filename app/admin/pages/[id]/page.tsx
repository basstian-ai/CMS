import Link from "next/link";
import { notFound } from "next/navigation";

import { deletePage, updatePage } from "@/app/admin/pages/actions";
import { LanguageToggleFields } from "@/components/admin/language-toggle-fields";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
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

export default async function PageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: page } = await supabase
    .from("pages")
    .select(
      "id, slug, title, summary, content_md, cta_label, cta_href, hero_image_path, layout_variant, status, published_at",
    )
    .eq("id", params.id)
    .single();

  if (!page) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Side
          </p>
          <h2 className="text-2xl font-semibold text-slate-100">
            {page.title?.no ?? "Uten tittel"}
          </h2>
        </div>
        <Link href="/admin/pages" className="text-sm text-slate-400 hover:text-white">
          ← Tilbake
        </Link>
      </div>

      <form action={updatePage.bind(null, page.id)} className="space-y-6">
        <LanguageToggleFields
          noContent={
            <div className="space-y-4">
              <label className="space-y-2 text-sm text-slate-200">
                Tittel (NO)
                <input
                  name="title"
                  required
                  defaultValue={page.title?.no ?? ""}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Sammendrag (NO)
                <textarea
                  name="summary"
                  rows={3}
                  defaultValue={page.summary?.no ?? ""}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                CTA-label (NO)
                <input
                  name="cta_label"
                  defaultValue={page.cta_label?.no ?? ""}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
                />
              </label>
              <MarkdownEditor
                label="Innhold (NO)"
                name="content"
                recordId={`page-${page.id}`}
                rows={12}
                defaultValue={page.content_md?.no ?? ""}
              />
            </div>
          }
          enContent={
            <div className="space-y-4">
              <label className="space-y-2 text-sm text-slate-200">
                Tittel (EN)
                <input
                  name="title_en"
                  defaultValue={page.title?.en ?? ""}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                Sammendrag (EN)
                <textarea
                  name="summary_en"
                  rows={3}
                  defaultValue={page.summary?.en ?? ""}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                CTA-label (EN)
                <input
                  name="cta_label_en"
                  defaultValue={page.cta_label?.en ?? ""}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
                />
              </label>
              <MarkdownEditor
                label="Innhold (EN)"
                name="content_en"
                recordId={`page-${page.id}`}
                rows={12}
                defaultValue={page.content_md?.en ?? ""}
              />
            </div>
          }
        />

        <div className="grid gap-4 md:grid-cols-2">
          <SlugField
            initialSlug={page.slug}
            slugName="slug"
            titleInputName="title"
            required
          />
          <label className="space-y-2 text-sm text-slate-200">
            Layoutvariant
            <select
              name="layout_variant"
              defaultValue={page.layout_variant ?? "standard"}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            >
              <option value="standard">Standard</option>
              <option value="editorial">Editorial</option>
              <option value="compact">Kompakt</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            CTA-lenke
            <input
              name="cta_href"
              defaultValue={page.cta_href ?? ""}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-200">
            Hero-bilde (sti eller URL)
            <input
              name="hero_image_path"
              defaultValue={page.hero_image_path ?? ""}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-200">
            Status
            <select
              name="status"
              defaultValue={page.status}
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
              defaultValue={formatDateTime(page.published_at)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900"
          >
            Lagre endringer
          </button>
          <button
            type="submit"
            formAction={deletePage.bind(null, page.id)}
            className="rounded-full border border-rose-500/60 px-5 py-2 text-sm font-semibold text-rose-200"
          >
            Slett side
          </button>
        </div>
      </form>
    </div>
  );
}
