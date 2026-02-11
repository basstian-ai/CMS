"use client";

import { useState, type ReactNode } from "react";

type LanguageToggleFieldsProps = {
  noContent: ReactNode;
  enContent: ReactNode;
  noLabel?: string;
  enLabel?: string;
};

export function LanguageToggleFields({
  noContent,
  enContent,
  noLabel = "NO",
  enLabel = "EN",
}: LanguageToggleFieldsProps) {
  const [activeLanguage, setActiveLanguage] = useState<"no" | "en">("no");

  return (
    <section className="space-y-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Language</p>
        <div className="inline-flex rounded-full border border-slate-700 bg-slate-950 p-1 text-sm">
          <button
            type="button"
            onClick={() => setActiveLanguage("no")}
            aria-pressed={activeLanguage === "no"}
            className={`rounded-full px-3 py-1 transition ${
              activeLanguage === "no"
                ? "bg-white text-slate-900"
                : "text-slate-300 hover:text-white"
            }`}
          >
            {noLabel}
          </button>
          <button
            type="button"
            onClick={() => setActiveLanguage("en")}
            aria-pressed={activeLanguage === "en"}
            className={`rounded-full px-3 py-1 transition ${
              activeLanguage === "en"
                ? "bg-white text-slate-900"
                : "text-slate-300 hover:text-white"
            }`}
          >
            {enLabel}
          </button>
        </div>
      </div>

      <fieldset
        disabled={activeLanguage !== "no"}
        aria-hidden={activeLanguage !== "no"}
        className={activeLanguage === "no" ? "block" : "hidden"}
      >
        {noContent}
      </fieldset>
      <fieldset
        disabled={activeLanguage !== "en"}
        aria-hidden={activeLanguage !== "en"}
        className={activeLanguage === "en" ? "block" : "hidden"}
      >
        {enContent}
      </fieldset>
    </section>
  );
}
