import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LocalizedField } from "@/lib/data/localization";

export type PublicPage = {
  id: string;
  slug: string;
  title: LocalizedField<string>;
  content_md: LocalizedField<string>;
  published_at: string | null;
};

const publishedFilter = {
  status: "published",
  now: () => new Date().toISOString(),
};

export async function getPageBySlug(slug: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("pages")
    .select("id, slug, title, content_md, published_at")
    .eq("slug", slug)
    .eq("status", publishedFilter.status)
    .lte("published_at", publishedFilter.now())
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as PublicPage | null;
}
