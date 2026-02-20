"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const statusOptions = new Set(["draft", "published", "archived"]);

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

function normalizePublishedAt(status: string, value: string | null) {
  const normalized = normalizeDate(value);
  if (!normalized && status === "published") {
    return new Date().toISOString();
  }
  return normalized;
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
  const coverImagePath = formData.get("cover_image_path")?.toString().trim() ?? "";
  const status = normalizeStatus(formData.get("status")?.toString() ?? null);
  const publishedAt = normalizePublishedAt(
    status,
    formData.get("published_at")?.toString() ?? null,
  );

  const payload = {
    slug,
    title: { no: title, en: titleEn || null },
    description_md: { no: description, en: descriptionEn || null },
    start_time: startTime,
    end_time: endTime,
    location: location || null,
    status,
    published_at: publishedAt,
    updated_by: userData?.user?.id ?? null,
  };

  const { data, error } = await supabase
    .from("events")
    .insert({
      ...payload,
      cover_image_path: coverImagePath || null,
    })
    .select("id")
    .single();

  if (!error) {
    revalidatePath("/admin/events");
    redirect(`/admin/events/${data.id}`);
  }

  if (!isMissingCoverImageColumnError(error)) {
    throw new Error(error.message);
  }

  const { data: legacyData, error: legacyError } = await supabase
    .from("events")
    .insert(payload)
    .select("id")
    .single();

  if (legacyError) {
    throw new Error(legacyError.message);
  }

  revalidatePath("/admin/events");
  redirect(`/admin/events/${legacyData.id}`);
}

export async function updateEvent(eventId: string, formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: existingEvent, error: existingEventError } = await supabase
    .from("events")
    .select("title, description_md")
    .eq("id", eventId)
    .maybeSingle();

  if (existingEventError) {
    throw new Error(existingEventError.message);
  }
  if (!existingEvent) {
    throw new Error("Event not found.");
  }

  const titleField = formData.get("title");
  const titleEnField = formData.get("title_en");
  const descriptionField = formData.get("description");
  const descriptionEnField = formData.get("description_en");

  const title =
    titleField === null
      ? existingEvent.title?.no ?? ""
      : titleField.toString().trim();
  const titleEn =
    titleEnField === null
      ? existingEvent.title?.en ?? null
      : titleEnField.toString().trim() || null;
  const slug = formData.get("slug")?.toString().trim() ?? "";
  const description =
    descriptionField === null
      ? existingEvent.description_md?.no ?? ""
      : descriptionField.toString().trim();
  const descriptionEn =
    descriptionEnField === null
      ? existingEvent.description_md?.en ?? null
      : descriptionEnField.toString().trim() || null;
  const startTime = normalizeDate(formData.get("start_time")?.toString() ?? null);
  const endTime = normalizeDate(formData.get("end_time")?.toString() ?? null);
  const location = formData.get("location")?.toString().trim() ?? "";
  const coverImagePath = formData.get("cover_image_path")?.toString().trim() ?? "";
  const status = normalizeStatus(formData.get("status")?.toString() ?? null);
  const publishedAt = normalizePublishedAt(
    status,
    formData.get("published_at")?.toString() ?? null,
  );

  const payload = {
    slug,
    title: { no: title, en: titleEn || null },
    description_md: { no: description, en: descriptionEn || null },
    start_time: startTime,
    end_time: endTime,
    location: location || null,
    status,
    published_at: publishedAt,
    updated_by: userData?.user?.id ?? null,
  };

  const { error } = await supabase
    .from("events")
    .update({
      ...payload,
      cover_image_path: coverImagePath || null,
    })
    .eq("id", eventId);

  if (!error) {
    revalidatePath("/admin/events");
    revalidatePath(`/admin/events/${eventId}`);
    return;
  }

  if (!isMissingCoverImageColumnError(error)) {
    throw new Error(error.message);
  }

  const { error: legacyError } = await supabase
    .from("events")
    .update(payload)
    .eq("id", eventId);

  if (legacyError) {
    throw new Error(legacyError.message);
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
