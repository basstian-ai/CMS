import {
  DO_NOT_TRANSLATE_TERMS,
  TRANSLATION_RULES_VERSION,
} from "@/lib/i18n/translation-glossary";

type TranslatorAvailability = "unavailable" | "downloadable" | "downloading" | "available";

type BrowserTranslator = {
  translate: (text: string) => Promise<string>;
  destroy?: () => void;
};

type TranslatorApi = {
  availability: (options: {
    sourceLanguage: string;
    targetLanguage: string;
  }) => Promise<TranslatorAvailability>;
  create: (options: {
    sourceLanguage: string;
    targetLanguage: string;
  }) => Promise<BrowserTranslator>;
};

const cachePrefix = `bykirken:auto-translate:${TRANSLATION_RULES_VERSION}`;
const memoryCache = new Map<string, string>();
const translatorCache = new Map<string, Promise<BrowserTranslator | null>>();
const pendingTranslationCache = new Map<string, Promise<string | null>>();

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function protectTerms(text: string) {
  let maskedText = text;
  const replacements: Array<{ token: string; value: string }> = [];

  for (const term of DO_NOT_TRANSLATE_TERMS) {
    const escapedTerm = escapeRegExp(term);
    const pattern = new RegExp(
      `(^|[^\\p{L}\\p{N}])(${escapedTerm})(?=$|[^\\p{L}\\p{N}])`,
      "giu",
    );

    maskedText = maskedText.replace(pattern, (_, prefix: string, match: string) => {
      const token = `[[__bt_term_${replacements.length}__]]`;
      replacements.push({ token, value: match });
      return `${prefix}${token}`;
    });
  }

  return { maskedText, replacements };
}

function restoreProtectedTerms(
  text: string,
  replacements: Array<{ token: string; value: string }>,
) {
  let restored = text;

  for (const replacement of replacements) {
    const escapedToken = escapeRegExp(replacement.token);
    const looseTokenPattern = escapedToken.replace(/_/g, "[_\\s]*");
    const tokenRegex = new RegExp(looseTokenPattern, "giu");
    restored = restored.replace(tokenRegex, replacement.value);
  }

  return restored;
}

async function translateViaApi(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        sourceLanguage,
        targetLanguage,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      translatedText?: string | null;
    };
    const translated = payload.translatedText?.trim();
    if (!translated || translated === text) {
      return null;
    }

    return translated;
  } catch {
    return null;
  }
}

function toLanguageTag(locale: string) {
  if (locale === "no") {
    return "nb";
  }
  return locale.toLowerCase();
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16);
}

function buildCacheKey(sourceLanguage: string, targetLanguage: string, text: string) {
  return `${cachePrefix}:${sourceLanguage}:${targetLanguage}:${hashString(text)}`;
}

function readLocalCache(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalCache(key: string, value: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage quota/private mode errors.
  }
}

function getTranslatorApi(): TranslatorApi | null {
  if (typeof window === "undefined") {
    return null;
  }

  const maybeTranslator = (window as { Translator?: TranslatorApi }).Translator;
  if (!maybeTranslator?.availability || !maybeTranslator?.create) {
    return null;
  }

  return maybeTranslator;
}

async function getTranslator(sourceLanguage: string, targetLanguage: string) {
  const pairKey = `${sourceLanguage}:${targetLanguage}`;
  const cachedTranslator = translatorCache.get(pairKey);
  if (cachedTranslator) {
    return cachedTranslator;
  }

  const translatorPromise = (async () => {
    try {
      const translatorApi = getTranslatorApi();
      if (!translatorApi) {
        return null;
      }

      const availability = await translatorApi.availability({
        sourceLanguage,
        targetLanguage,
      });

      if (availability === "unavailable") {
        return null;
      }

      return await translatorApi.create({
        sourceLanguage,
        targetLanguage,
      });
    } catch {
      return null;
    }
  })();

  translatorCache.set(pairKey, translatorPromise);
  return translatorPromise;
}

export async function autoTranslateText(
  text: string,
  sourceLocale: string,
  targetLocale: string,
) {
  const normalizedText = text.trim();
  if (!normalizedText) {
    return null;
  }

  const sourceLanguage = toLanguageTag(sourceLocale);
  const targetLanguage = toLanguageTag(targetLocale);

  if (sourceLanguage === targetLanguage) {
    return null;
  }

  const { maskedText, replacements } = protectTerms(normalizedText);
  const inputText = maskedText.trim();
  if (!inputText) {
    return null;
  }

  const cacheKey = buildCacheKey(sourceLanguage, targetLanguage, normalizedText);
  const memoryCachedValue = memoryCache.get(cacheKey);
  if (memoryCachedValue) {
    return memoryCachedValue;
  }

  const localCachedValue = readLocalCache(cacheKey);
  if (localCachedValue) {
    memoryCache.set(cacheKey, localCachedValue);
    return localCachedValue;
  }

  const pendingTranslation = pendingTranslationCache.get(cacheKey);
  if (pendingTranslation) {
    return pendingTranslation;
  }

  const translationPromise = (async () => {
    try {
      let translated: string | null = null;

      const translator = await getTranslator(sourceLanguage, targetLanguage);
      if (translator) {
        try {
          const browserTranslated = (await translator.translate(inputText)).trim();
          if (browserTranslated && browserTranslated !== inputText) {
            translated = browserTranslated;
          }
        } catch {
          translated = null;
        }
      }

      if (!translated) {
        translated = await translateViaApi(
          inputText,
          sourceLanguage,
          targetLanguage,
        );
      }

      if (!translated) {
        return null;
      }

      translated = restoreProtectedTerms(translated, replacements).trim();
      if (!translated || translated === normalizedText) {
        return null;
      }

      memoryCache.set(cacheKey, translated);
      writeLocalCache(cacheKey, translated);
      return translated;
    } finally {
      pendingTranslationCache.delete(cacheKey);
    }
  })();

  pendingTranslationCache.set(cacheKey, translationPromise);
  return translationPromise;
}
