"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const statusOptions = new Set(["draft", "published", "archived"]);

function normalizeStatus(status: string | null) {
  if (status && statusOptions.has(status)) {
    return status;
  }
  return "draft";
}

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

export async function createEvent(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const title = formData.get("title")?.toString().trim() ?? "";
  const titleEn = formData.get("title_en")?.toString().trim() ?? "";
  const slug = formData.get("slug")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";
  const descriptionEn = formData.get("description_en")?.toString().trim() ?? "";
  const startTime = normalizeDate(formData.get("start_time")?.toString() ?? null);
  const endTime = normalizeDate(formData.get("end_time")?.toString() ?? null);
  const location = formData.get("location")?.toString().trim() ?? "";
  const status = normalizeStatus(formData.get("status")?.toString() ?? null);
  const publishedAt = normalizeDate(formData.get("published_at")?.toString() ?? null);

  const { data, error } = await supabase
    .from("events")
    .insert({
      slug,
      title: { no: title, en: titleEn || null },
      description_md: { no: description, en: descriptionEn || null },
      start_time: startTime,
      end_time: endTime,
      location: location || null,
      status,
      published_at: publishedAt,
      updated_by: userData?.user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/events");
  redirect(`/admin/events/${data.id}`);
}

export async function updateEvent(eventId: string, formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const title = formData.get("title")?.toString().trim() ?? "";
  const titleEn = formData.get("title_en")?.toString().trim() ?? "";
  const slug = formData.get("slug")?.toString().trim() ?? "";
  const description = formData.get("description")?.toString().trim() ?? "";
  const descriptionEn = formData.get("description_en")?.toString().trim() ?? "";
  const startTime = normalizeDate(formData.get("start_time")?.toString() ?? null);
  const endTime = normalizeDate(formData.get("end_time")?.toString() ?? null);
  const location = formData.get("location")?.toString().trim() ?? "";
  const status = normalizeStatus(formData.get("status")?.toString() ?? null);
  const publishedAt = normalizeDate(formData.get("published_at")?.toString() ?? null);

  const { error } = await supabase
    .from("events")
    .update({
      slug,
      title: { no: title, en: titleEn || null },
      description_md: { no: description, en: descriptionEn || null },
      start_time: startTime,
      end_time: endTime,
      location: location || null,
      status,
      published_at: publishedAt,
      updated_by: userData?.user?.id ?? null,
    })
    .eq("id", eventId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
}

export async function deleteEvent(eventId: string) {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/events");
  redirect("/admin/events");
}
