"use client";

import { useEffect, useState } from "react";

import { autoTranslateText } from "@/lib/i18n/auto-translate";

type AutoTranslatedTextProps = {
  text: string;
  sourceLocale: string;
  targetLocale: string;
  enabled: boolean;
  showBadge?: boolean;
};

export function AutoTranslatedText({
  text,
  sourceLocale,
  targetLocale,
  enabled,
  showBadge = false,
}: AutoTranslatedTextProps) {
  const [translatedText, setTranslatedText] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setTranslatedText(null);

    if (!enabled) {
      return () => {
        isCancelled = true;
      };
    }

    autoTranslateText(text, sourceLocale, targetLocale).then((value) => {
      if (!isCancelled && value && value !== text) {
        setTranslatedText(value);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [enabled, sourceLocale, targetLocale, text]);

  const output = translatedText ?? text;

  return (
    <span data-no-auto-translate>
      {output}
      {showBadge && translatedText ? (
        <span className="ml-2 inline-flex rounded-full bg-accent-soft px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-ink-muted">
          Automatisk oversatt
        </span>
      ) : null}
    </span>
  );
}
