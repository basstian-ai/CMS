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

const eventSelectWithCoverImage =
  "id, slug, title, description_md, cover_image_path, start_time, end_time, location, published_at";
const eventSelectLegacy =
  "id, slug, title, description_md, start_time, end_time, location, published_at";

type LegacyPublicEvent = Omit<PublicEvent, "cover_image_path">;

function isMissingCoverImageColumnError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "42703" &&
    (error.message?.includes("events.cover_image_path") ||
      error.message?.includes("cover_image_path") ||
      false)
  );
}

function normalizeEvents(events: LegacyPublicEvent[]) {
  return events.map((event) => ({
    ...event,
    cover_image_path: null,
  }));
}

export async function getUpcomingEvents(limit: number) {
  const supabase = createSupabaseServerClient();
  const now = publishedFilter.now();
  const publishedAtFilter = `published_at.is.null,published_at.lte.${now}`;
  const primaryQuery = supabase
    .from("events")
    .select(eventSelectWithCoverImage)
    .eq("status", publishedFilter.status)
    .or(publishedAtFilter)
    .gte("start_time", now)
    .order("start_time", { ascending: true })
    .limit(limit);

  const { data, error } = await primaryQuery;

  if (!error) {
    return (data ?? []) as PublicEvent[];
  }

  if (!isMissingCoverImageColumnError(error)) {
    throw error;
  }

  const { data: legacyData, error: legacyError } = await supabase
    .from("events")
    .select(eventSelectLegacy)
    .eq("status", publishedFilter.status)
    .or(publishedAtFilter)
    .gte("start_time", now)
    .order("start_time", { ascending: true })
    .limit(limit);

  if (legacyError) {
    throw legacyError;
  }

  return normalizeEvents((legacyData ?? []) as LegacyPublicEvent[]);
}

export async function getEventBySlug(slug: string) {
  const supabase = createSupabaseServerClient();
  const now = publishedFilter.now();
  const { data, error } = await supabase
    .from("events")
    .select(eventSelectWithCoverImage)
    .eq("slug", slug)
    .eq("status", publishedFilter.status)
    .or(`published_at.is.null,published_at.lte.${now}`)
    .maybeSingle();

  if (!error) {
    return data as PublicEvent | null;
  }

  if (!isMissingCoverImageColumnError(error)) {
    throw error;
  }

  const { data: legacyData, error: legacyError } = await supabase
    .from("events")
    .select(eventSelectLegacy)
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

  return {
    ...(legacyData as LegacyPublicEvent),
    cover_image_path: null,
  };
}
