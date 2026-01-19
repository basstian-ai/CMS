"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeDate(value: string | null) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

function normalizeNumber(value: string | null) {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}

export async function createSermon(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const title = formData.get("title")?.toString().trim() ?? "";
  const slug = formData.get("slug")?.toString().trim() ?? "";
  const preacher = formData.get("preacher")?.toString().trim() ?? "";
  const bibleRef = formData.get("bible_ref")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";
  const filename = formData.get("filename")?.toString().trim() ?? "";
  const audioPath = formData.get("audio_path")?.toString().trim() ?? "";
  const spotifyUrl = formData.get("external_spotify_url")?.toString().trim() ?? "";
  const appleUrl = formData.get("external_apple_url")?.toString().trim() ?? "";
  const publishedAt = normalizeDate(formData.get("published_at")?.toString() ?? null);
  const durationSeconds = normalizeNumber(formData.get("duration_seconds")?.toString() ?? null);
  const fileSize = normalizeNumber(formData.get("file_size")?.toString() ?? null);

  const { data, error } = await supabase
    .from("sermons")
    .insert({
      title,
      slug,
      preacher: preacher || null,
      bible_ref: bibleRef || null,
      description: description || null,
      filename: filename || null,
      audio_path: audioPath || null,
      external_spotify_url: spotifyUrl || null,
      external_apple_url: appleUrl || null,
      published_at: publishedAt,
      duration_seconds: durationSeconds,
      file_size: fileSize,
      updated_by: userData?.user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/sermons");
  redirect(`/admin/sermons/${data.id}`);
}

export async function updateSermon(sermonId: string, formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const title = formData.get("title")?.toString().trim() ?? "";
  const slug = formData.get("slug")?.toString().trim() ?? "";
  const preacher = formData.get("preacher")?.toString().trim() ?? "";
  const bibleRef = formData.get("bible_ref")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";
  const filename = formData.get("filename")?.toString().trim() ?? "";
  const audioPath = formData.get("audio_path")?.toString().trim() ?? "";
  const spotifyUrl = formData.get("external_spotify_url")?.toString().trim() ?? "";
  const appleUrl = formData.get("external_apple_url")?.toString().trim() ?? "";
  const publishedAt = normalizeDate(formData.get("published_at")?.toString() ?? null);
  const durationSeconds = normalizeNumber(formData.get("duration_seconds")?.toString() ?? null);
  const fileSize = normalizeNumber(formData.get("file_size")?.toString() ?? null);

  const { error } = await supabase
    .from("sermons")
    .update({
      title,
      slug,
      preacher: preacher || null,
      bible_ref: bibleRef || null,
      description: description || null,
      filename: filename || null,
      audio_path: audioPath || null,
      external_spotify_url: spotifyUrl || null,
      external_apple_url: appleUrl || null,
      published_at: publishedAt,
      duration_seconds: durationSeconds,
      file_size: fileSize,
      updated_by: userData?.user?.id ?? null,
    })
    .eq("id", sermonId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/sermons");
  revalidatePath(`/admin/sermons/${sermonId}`);
}

export async function deleteSermon(sermonId: string) {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("sermons").delete().eq("id", sermonId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/sermons");
  redirect("/admin/sermons");
}
