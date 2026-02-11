const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";

export function resolvePublicImageUrl(
  source: string | null | undefined,
  bucket = "images"
): string | null {
  if (!source) {
    return null;
  }

  const value = source.trim();
  if (!value) {
    return null;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  if (!supabaseUrl) {
    return null;
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${value.replace(/^\/+/, "")}`;
}
