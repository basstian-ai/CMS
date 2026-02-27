export type Locale = "no" | "en" | (string & {});

export type LocalizedField<T> = Record<string, T | null | undefined>;
export type LocalizedFieldResolution<T> = {
  value: T | null;
  sourceLocale: Locale | null;
  usedFallback: boolean;
  missingRequestedLocale: boolean;
};

function hasValue<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function normalizeLocale(
  value: string | null | undefined,
  fallback: Locale = "no",
) {
  if (value === "no" || value === "en") {
    return value;
  }
  return fallback;
}

export function resolveLocalizedField<T>(
  field: LocalizedField<T> | null | undefined,
  locale: Locale,
  fallbackLocale: Locale = "no",
) {
  return resolveLocalizedFieldWithMeta(field, locale, fallbackLocale).value;
}

export function resolveLocalizedFieldWithMeta<T>(
  field: LocalizedField<T> | null | undefined,
  locale: Locale,
  fallbackLocale: Locale = "no",
): LocalizedFieldResolution<T> {
  if (!field) {
    return {
      value: null,
      sourceLocale: null,
      usedFallback: false,
      missingRequestedLocale: false,
    };
  }

  const localizedValue = field[locale];
  if (hasValue(localizedValue)) {
    return {
      value: localizedValue,
      sourceLocale: locale,
      usedFallback: false,
      missingRequestedLocale: false,
    };
  }

  const fallbackValue = field[fallbackLocale];
  if (hasValue(fallbackValue)) {
    const usedFallback = locale !== fallbackLocale;
    return {
      value: fallbackValue,
      sourceLocale: fallbackLocale,
      usedFallback,
      missingRequestedLocale: usedFallback,
    };
  }

  return {
    value: null,
    sourceLocale: null,
    usedFallback: false,
    missingRequestedLocale: false,
  };
}
