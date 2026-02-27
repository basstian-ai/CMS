"use client";

import { useEffect, useState } from "react";

import { autoTranslateText } from "@/lib/i18n/auto-translate";

import { MarkdownRenderer } from "@/components/markdown-renderer";

type AutoTranslatedMarkdownProps = {
  content: string;
  sourceLocale: string;
  targetLocale: string;
  enabled: boolean;
  className?: string;
  showBadge?: boolean;
};

export function AutoTranslatedMarkdown({
  content,
  sourceLocale,
  targetLocale,
  enabled,
  className,
  showBadge = true,
}: AutoTranslatedMarkdownProps) {
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setTranslatedContent(null);

    if (!enabled) {
      return () => {
        isCancelled = true;
      };
    }

    autoTranslateText(content, sourceLocale, targetLocale).then((value) => {
      if (!isCancelled && value && value !== content) {
        setTranslatedContent(value);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [content, enabled, sourceLocale, targetLocale]);

  return (
    <div className="space-y-3" data-no-auto-translate>
      {showBadge && translatedContent ? (
        <p className="text-xs uppercase tracking-[0.08em] text-stone-500">
          Automatisk oversatt
        </p>
      ) : null}
      <MarkdownRenderer content={translatedContent ?? content} className={className} />
    </div>
  );
}
