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

export async function createPost(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const title = formData.get("title")?.toString().trim() ?? "";
  const slug = formData.get("slug")?.toString().trim() ?? "";
  const excerpt = formData.get("excerpt")?.toString().trim() ?? "";
  const content = formData.get("content")?.toString().trim() ?? "";
  const status = normalizeStatus(formData.get("status")?.toString() ?? null);
  const publishedAt = normalizeDate(formData.get("published_at")?.toString() ?? null);
  const coverImagePath = formData.get("cover_image_path")?.toString().trim() ?? "";

  const { data, error } = await supabase
    .from("posts")
    .insert({
      slug,
      title: { no: title },
      excerpt: { no: excerpt },
      content_md: { no: content },
      status,
      published_at: publishedAt,
      cover_image_path: coverImagePath || null,
      updated_by: userData?.user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${data.id}`);
}

export async function updatePost(postId: string, formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const title = formData.get("title")?.toString().trim() ?? "";
  const slug = formData.get("slug")?.toString().trim() ?? "";
  const excerpt = formData.get("excerpt")?.toString().trim() ?? "";
  const content = formData.get("content")?.toString().trim() ?? "";
  const status = normalizeStatus(formData.get("status")?.toString() ?? null);
  const publishedAt = normalizeDate(formData.get("published_at")?.toString() ?? null);
  const coverImagePath = formData.get("cover_image_path")?.toString().trim() ?? "";

  const { error } = await supabase
    .from("posts")
    .update({
      slug,
      title: { no: title },
      excerpt: { no: excerpt },
      content_md: { no: content },
      status,
      published_at: publishedAt,
      cover_image_path: coverImagePath || null,
      updated_by: userData?.user?.id ?? null,
    })
    .eq("id", postId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${postId}`);
}

export async function deletePost(postId: string) {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("posts").delete().eq("id", postId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}
