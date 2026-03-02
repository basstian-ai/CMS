import { createSupabasePublicClient } from "@/lib/supabase/server";
import type { LocalizedField } from "@/lib/data/localization";

export type PublicPage = {
  id: string;
  slug: string;
  title: LocalizedField<string>;
  summary: LocalizedField<string> | null;
  content_md: LocalizedField<string>;
  hero_image_path: string | null;
  cta_label: LocalizedField<string> | null;
  cta_href: string | null;
  layout_variant: string | null;
  published_at: string | null;
};

type LegacyPublicPage = Omit<
  PublicPage,
  "summary" | "hero_image_path" | "cta_label" | "cta_href" | "layout_variant"
>;

const publishedFilter = {
  status: "published",
  now: () => new Date().toISOString(),
};

const pageSelectWithPresentation =
  "id, slug, title, summary, content_md, hero_image_path, cta_label, cta_href, layout_variant, published_at";

const pageSelectLegacy = "id, slug, title, content_md, published_at";

function isMissingPresentationColumnError(
  error: { code?: string; message?: string; details?: string; hint?: string } | null,
) {
  const isMissingColumnCode = error?.code === "42703";
  const isMissingSchemaCacheCode = error?.code === "PGRST204";
  const errorText = [error?.message, error?.details, error?.hint].join(" ").toLowerCase();

  return (
    (isMissingColumnCode || isMissingSchemaCacheCode) &&
    (errorText.includes("pages.summary") ||
      errorText.includes("pages.hero_image_path") ||
      errorText.includes("pages.cta_label") ||
      errorText.includes("pages.cta_href") ||
      errorText.includes("pages.layout_variant"))
  );
}

function withPresentationDefaults(page: LegacyPublicPage): PublicPage {
  return {
    ...page,
    summary: null,
    hero_image_path: null,
    cta_label: null,
    cta_href: null,
    layout_variant: "standard",
  };
}

export async function getPageBySlug(slug: string) {
  const supabase = createSupabasePublicClient();
  const now = publishedFilter.now();
  const { data, error } = await supabase
    .from("pages")
    .select(pageSelectWithPresentation)
    .eq("slug", slug)
    .eq("status", publishedFilter.status)
    .or(`published_at.is.null,published_at.lte.${now}`)
    .maybeSingle();

  if (!error) {
    return data as PublicPage | null;
  }

  if (!isMissingPresentationColumnError(error)) {
    throw error;
  }

  const { data: legacyData, error: legacyError } = await supabase
    .from("pages")
    .select(pageSelectLegacy)
    .eq("slug", slug)
    .eq("status", publishedFilter.status)
    .or(`published_at.is.null,published_at.lte.${now}`)
    .maybeSingle();

  if (legacyError) {
    throw legacyError;
  }

  if (!legacyData) {
    return null;
  }

  return withPresentationDefaults(legacyData as LegacyPublicPage);
}
