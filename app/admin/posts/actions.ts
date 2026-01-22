"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

const statusOptions = new Set(["draft", "published", "archived"]);
const editorRoles = new Set(["admin", "editor"]);

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

async function requireEditorUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const adminClient = createSupabaseAdminClient();
  const { data: profile, error } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!profile || !editorRoles.has(profile.role)) {
    throw new Error("User does not have permission to manage posts.");
  }

  return { adminClient, userId: user.id };
}

export async function createPost(formData: FormData) {
  const { adminClient, userId } = await requireEditorUser();

  const title = formData.get("title")?.toString().trim() ?? "";
  const titleEn = formData.get("title_en")?.toString().trim() ?? "";
  const slug = formData.get("slug")?.toString().trim() ?? "";
  const excerpt = formData.get("excerpt")?.toString().trim() ?? "";
  const excerptEn = formData.get("excerpt_en")?.toString().trim() ?? "";
  const content = formData.get("content")?.toString().trim() ?? "";
  const contentEn = formData.get("content_en")?.toString().trim() ?? "";
  const status = normalizeStatus(formData.get("status")?.toString() ?? null);
  const publishedAt = normalizePublishedAt(
    status,
    formData.get("published_at")?.toString() ?? null,
  );
  const coverImagePath = formData.get("cover_image_path")?.toString().trim() ?? "";

  const { data, error } = await adminClient
    .from("posts")
    .insert({
      slug,
      title: { no: title, en: titleEn || null },
      excerpt: { no: excerpt, en: excerptEn || null },
      content_md: { no: content, en: contentEn || null },
      status,
      published_at: publishedAt,
      cover_image_path: coverImagePath || null,
      updated_by: userId,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/posts");
  revalidatePath("/");
  redirect(`/admin/posts/${data.id}`);
}

export async function updatePost(postId: string, formData: FormData) {
  const { adminClient, userId } = await requireEditorUser();

  const title = formData.get("title")?.toString().trim() ?? "";
  const titleEn = formData.get("title_en")?.toString().trim() ?? "";
  const slug = formData.get("slug")?.toString().trim() ?? "";
  const excerpt = formData.get("excerpt")?.toString().trim() ?? "";
  const excerptEn = formData.get("excerpt_en")?.toString().trim() ?? "";
  const content = formData.get("content")?.toString().trim() ?? "";
  const contentEn = formData.get("content_en")?.toString().trim() ?? "";
  const status = normalizeStatus(formData.get("status")?.toString() ?? null);
  const publishedAt = normalizePublishedAt(
    status,
    formData.get("published_at")?.toString() ?? null,
  );
  const coverImagePath = formData.get("cover_image_path")?.toString().trim() ?? "";

  const { error } = await adminClient
    .from("posts")
    .update({
      slug,
      title: { no: title, en: titleEn || null },
      excerpt: { no: excerpt, en: excerptEn || null },
      content_md: { no: content, en: contentEn || null },
      status,
      published_at: publishedAt,
      cover_image_path: coverImagePath || null,
      updated_by: userId,
    })
    .eq("id", postId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${postId}`);
  revalidatePath("/");
}

export async function deletePost(postId: string) {
  const { adminClient } = await requireEditorUser();

  const { error } = await adminClient.from("posts").delete().eq("id", postId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/posts");
  revalidatePath("/");
  redirect("/admin/posts");
}
