import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PublicSermon = {
  id: string;
  slug: string;
  title: string;
  preacher: string | null;
  bible_ref: string | null;
  description: string | null;
  published_at: string | null;
  audio_path: string | null;
  external_spotify_url: string | null;
  external_apple_url: string | null;
  duration_seconds: number | null;
};

const publishedFilter = {
  now: () => new Date().toISOString(),
};

export async function getLatestSermons(limit: number) {
  const supabase = createSupabaseServerClient();
  const now = publishedFilter.now();
  const { data, error } = await supabase
    .from("sermons")
    .select(
      "id, slug, title, preacher, bible_ref, description, published_at, audio_path, external_spotify_url, external_apple_url, duration_seconds",
    )
    .or(`published_at.is.null,published_at.lte.${now}`)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as PublicSermon[];
}

export async function getSermonBySlug(slug: string) {
  const supabase = createSupabaseServerClient();
  const now = publishedFilter.now();
  const { data, error } = await supabase
    .from("sermons")
    .select(
      "id, slug, title, preacher, bible_ref, description, published_at, audio_path, external_spotify_url, external_apple_url, duration_seconds",
    )
    .eq("slug", slug)
    .or(`published_at.is.null,published_at.lte.${now}`)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as PublicSermon | null;
}
