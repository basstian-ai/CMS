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

function isMissingCoverImageColumnError(
  error: { code?: string; message?: string; details?: string; hint?: string } | null,
) {
  const isMissingColumnCode = error?.code === "42703";
  const isMissingSchemaCacheCode = error?.code === "PGRST204";
  const errorText = [error?.message, error?.details, error?.hint].join(" ").toLowerCase();

  return (
    (isMissingColumnCode || isMissingSchemaCacheCode) &&
    (errorText.includes("events.cover_image_path") || errorText.includes("cover_image_path"))
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
  const upcomingFilter = `start_time.gte.${now},end_time.gte.${now}`;

  const primaryQuery = supabase
    .from("events")
    .select(eventSelectWithCoverImage)
    .eq("status", publishedFilter.status)
    .or(publishedAtFilter)
    .or(upcomingFilter)
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
    .or(upcomingFilter)
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
