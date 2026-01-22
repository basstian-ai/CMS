export function toMetadataDescription(
  value: string | null | undefined,
  fallback: string,
) {
  if (!value) {
    return fallback;
  }

  const withoutLinks = value.replace(/\[(.*?)\]\(.*?\)/g, "$1");
  const cleaned = withoutLinks.replace(/[#>*_`]/g, "");
  const normalized = cleaned.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return fallback;
  }

  return normalized.slice(0, 160);
}
