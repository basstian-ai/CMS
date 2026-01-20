export type Locale = "no" | "en" | (string & {});

export type LocalizedField<T> = Record<string, T | null | undefined>;

export function resolveLocalizedField<T>(
  field: LocalizedField<T> | null | undefined,
  locale: Locale,
  fallbackLocale: Locale = "no",
) {
  if (!field) {
    return null;
  }

  return field[locale] ?? field[fallbackLocale] ?? null;
}
