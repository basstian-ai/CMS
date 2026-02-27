import { createSupabasePublicClient } from "@/lib/supabase/server";
import type { LocalizedField } from "@/lib/data/localization";

export type PublicPost = {
  id: string;
  slug: string;
  title: LocalizedField<string>;
  excerpt: LocalizedField<string> | null;
  cover_image_path: string | null;
  published_at: string | null;
};

export type PublicPostDetail = {
  id: string;
  slug: string;
  title: LocalizedField<string>;
  content_md: LocalizedField<string>;
  cover_image_path: string | null;
  published_at: string | null;
};

const publishedFilter = {
  status: "published",
  now: () => new Date().toISOString(),
};

export async function getLatestPosts(limit: number) {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, cover_image_path, published_at")
    .eq("status", publishedFilter.status)
    .lte("published_at", publishedFilter.now())
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []) as PublicPost[];
}

export async function getPublishedPosts() {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, excerpt, cover_image_path, published_at")
    .eq("status", publishedFilter.status)
    .lte("published_at", publishedFilter.now())
    .order("published_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as PublicPost[];
}

export async function getPostBySlug(slug: string) {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, content_md, cover_image_path, published_at")
    .eq("slug", slug)
    .eq("status", publishedFilter.status)
    .lte("published_at", publishedFilter.now())
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as PublicPostDetail | null;
}
