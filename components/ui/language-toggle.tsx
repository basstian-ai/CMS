"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { UrlObject } from "url";

import { normalizeLocale } from "@/lib/data/localization";
import { cn } from "@/lib/utils";

const locales = [
  { value: "no", label: "NO" },
  { value: "en", label: "EN" },
] as const;

function readCookieLocale() {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(/(?:^|; )lang=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function setLanguageCookie(locale: string) {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `lang=${encodeURIComponent(locale)}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageToggle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [cookieLocale, setCookieLocale] = useState<string | null>(null);

  useEffect(() => {
    setCookieLocale(readCookieLocale());
  }, []);

  useEffect(() => {
    const searchLocale = searchParams.get("lang");
    if (!searchLocale) {
      return;
    }

    const normalized = normalizeLocale(searchLocale, "no");
    setLanguageCookie(normalized);
    setCookieLocale(normalized);
  }, [searchParams]);

  const currentLocale = useMemo(() => {
    const searchLocale = searchParams.get("lang");
    return normalizeLocale(searchLocale ?? cookieLocale ?? "no", "no");
  }, [searchParams, cookieLocale]);

  const createHref = (locale: string): UrlObject => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", locale);
    return { pathname, query: Object.fromEntries(params.entries()) };
  };

  return (
    <div
      className="flex items-center gap-1 rounded-full bg-[#efe5d8] p-1 text-xs font-semibold text-stone-700"
      data-no-auto-translate
    >
      {locales.map((locale) => {
        const isActive = currentLocale === locale.value;
        return (
          <Link
            key={locale.value}
            href={createHref(locale.value)}
            onClick={() => {
              setLanguageCookie(locale.value);
              setCookieLocale(locale.value);
            }}
            className={cn(
              "rounded-full px-3 py-1 transition",
              isActive
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            {locale.label}
          </Link>
        );
      })}
    </div>
  );
}
