"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const statusOptions = new Set(["draft", "published", "archived"]);
const layoutVariantOptions = new Set(["standard", "editorial", "compact"]);

function normalizeStatus(status: string | null) {
  if (status && statusOptions.has(status)) {
    return status;
  }
  return "draft";
}

function normalizeLayoutVariant(variant: string | null) {
  if (variant && layoutVariantOptions.has(variant)) {
    return variant;
  }
  return "standard";
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

function normalizeOptionalString(value: FormDataEntryValue | null) {
  if (!value) {
    return null;
  }

  const normalized = value.toString().trim();
  return normalized.length ? normalized : null;
}

export async function createPage(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const title = formData.get("title")?.toString().trim() ?? "";
  const titleEn = formData.get("title_en")?.toString().trim() ?? "";
  const summary = formData.get("summary")?.toString().trim() ?? "";
  const summaryEn = formData.get("summary_en")?.toString().trim() ?? "";
  const slug = formData.get("slug")?.toString().trim() ?? "";
  const content = formData.get("content")?.toString().trim() ?? "";
  const contentEn = formData.get("content_en")?.toString().trim() ?? "";
  const ctaLabel = formData.get("cta_label")?.toString().trim() ?? "";
  const ctaLabelEn = formData.get("cta_label_en")?.toString().trim() ?? "";
  const ctaHref = normalizeOptionalString(formData.get("cta_href"));
  const heroImagePath = normalizeOptionalString(formData.get("hero_image_path"));
  const status = normalizeStatus(formData.get("status")?.toString() ?? null);
  const layoutVariant = normalizeLayoutVariant(
    formData.get("layout_variant")?.toString() ?? null,
  );
  const publishedAt = normalizeDate(formData.get("published_at")?.toString() ?? null);

  const { data, error } = await supabase
    .from("pages")
    .insert({
      slug,
      title: { no: title, en: titleEn || null },
      summary: { no: summary || null, en: summaryEn || null },
      content_md: { no: content, en: contentEn || null },
      cta_label: { no: ctaLabel || null, en: ctaLabelEn || null },
      cta_href: ctaHref,
      hero_image_path: heroImagePath,
      layout_variant: layoutVariant,
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

  const { data: existingPage, error: existingPageError } = await supabase
    .from("pages")
    .select(
      "title, summary, content_md, cta_label, cta_href, hero_image_path, layout_variant",
    )
    .eq("id", pageId)
    .maybeSingle();

  if (existingPageError) {
    throw new Error(existingPageError.message);
  }
  if (!existingPage) {
    throw new Error("Page not found.");
  }

  const titleField = formData.get("title");
  const titleEnField = formData.get("title_en");
  const summaryField = formData.get("summary");
  const summaryEnField = formData.get("summary_en");
  const contentField = formData.get("content");
  const contentEnField = formData.get("content_en");
  const ctaLabelField = formData.get("cta_label");
  const ctaLabelEnField = formData.get("cta_label_en");

  const title =
    titleField === null
      ? existingPage.title?.no ?? ""
      : titleField.toString().trim();
  const titleEn =
    titleEnField === null
      ? existingPage.title?.en ?? null
      : titleEnField.toString().trim() || null;

  const summary =
    summaryField === null
      ? existingPage.summary?.no ?? null
      : summaryField.toString().trim() || null;
  const summaryEn =
    summaryEnField === null
      ? existingPage.summary?.en ?? null
      : summaryEnField.toString().trim() || null;

  const slug = formData.get("slug")?.toString().trim() ?? "";

  const content =
    contentField === null
      ? existingPage.content_md?.no ?? ""
      : contentField.toString().trim();
  const contentEn =
    contentEnField === null
      ? existingPage.content_md?.en ?? null
      : contentEnField.toString().trim() || null;

  const ctaLabel =
    ctaLabelField === null
      ? existingPage.cta_label?.no ?? null
      : ctaLabelField.toString().trim() || null;
  const ctaLabelEn =
    ctaLabelEnField === null
      ? existingPage.cta_label?.en ?? null
      : ctaLabelEnField.toString().trim() || null;

  const ctaHrefField = formData.get("cta_href");
  const heroImagePathField = formData.get("hero_image_path");
  const layoutVariantField = formData.get("layout_variant");

  const ctaHref =
    ctaHrefField === null
      ? (existingPage.cta_href ?? null)
      : ctaHrefField.toString().trim() || null;
  const heroImagePath =
    heroImagePathField === null
      ? (existingPage.hero_image_path ?? null)
      : heroImagePathField.toString().trim() || null;

  const layoutVariant =
    layoutVariantField === null
      ? normalizeLayoutVariant(existingPage.layout_variant ?? "standard")
      : normalizeLayoutVariant(layoutVariantField.toString());

  const status = normalizeStatus(formData.get("status")?.toString() ?? null);
  const publishedAt = normalizeDate(formData.get("published_at")?.toString() ?? null);

  const { error } = await supabase
    .from("pages")
    .update({
      slug,
      title: { no: title, en: titleEn || null },
      summary: { no: summary || null, en: summaryEn || null },
      content_md: { no: content, en: contentEn || null },
      cta_label: { no: ctaLabel || null, en: ctaLabelEn || null },
      cta_href: ctaHref,
      hero_image_path: heroImagePath,
      layout_variant: layoutVariant,
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
