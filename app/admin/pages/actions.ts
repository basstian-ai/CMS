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

export async function createPage(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const title = formData.get("title")?.toString().trim() ?? "";
  const slug = formData.get("slug")?.toString().trim() ?? "";
  const content = formData.get("content")?.toString().trim() ?? "";
  const status = normalizeStatus(formData.get("status")?.toString() ?? null);
  const publishedAt = normalizeDate(formData.get("published_at")?.toString() ?? null);

  const { data, error } = await supabase
    .from("pages")
    .insert({
      slug,
      title: { no: title },
      content_md: { no: content },
      status,
      published_at: publishedAt,
      updated_by: userData?.user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${data.id}`);
}

export async function updatePage(pageId: string, formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const title = formData.get("title")?.toString().trim() ?? "";
  const slug = formData.get("slug")?.toString().trim() ?? "";
  const content = formData.get("content")?.toString().trim() ?? "";
  const status = normalizeStatus(formData.get("status")?.toString() ?? null);
  const publishedAt = normalizeDate(formData.get("published_at")?.toString() ?? null);

  const { error } = await supabase
    .from("pages")
    .update({
      slug,
      title: { no: title },
      content_md: { no: content },
      status,
      published_at: publishedAt,
      updated_by: userData?.user?.id ?? null,
    })
    .eq("id", pageId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${pageId}`);
}

export async function deletePage(pageId: string) {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("pages").delete().eq("id", pageId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}
