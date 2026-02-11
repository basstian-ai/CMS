import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LocalizedField } from "@/lib/data/localization";

export type PublicEvent = {
  id: string;
  slug: string;
  title: LocalizedField<string>;
  description_md: LocalizedField<string>;
  cover_image_path: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  published_at: string | null;
};

const publishedFilter = {
  status: "published",
  now: () => new Date().toISOString(),
};

export async function getUpcomingEvents(limit: number) {
  const supabase = createSupabaseServerClient();
  const now = publishedFilter.now();
  const publishedAtFilter = `published_at.is.null,published_at.lte.${now}`;
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, slug, title, description_md, cover_image_path, start_time, end_time, location, published_at",
    )
    .eq("status", publishedFilter.status)
    .or(publishedAtFilter)
    .gte("start_time", now)
    .order("start_time", { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as PublicEvent[];
}

export async function getEventBySlug(slug: string) {
  const supabase = createSupabaseServerClient();
  const now = publishedFilter.now();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, slug, title, description_md, cover_image_path, start_time, end_time, location, published_at",
    )
    .eq("slug", slug)
    .eq("status", publishedFilter.status)
    .or(`published_at.is.null,published_at.lte.${now}`)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as PublicEvent | null;
}
