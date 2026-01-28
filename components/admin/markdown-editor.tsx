"use client";

import { useId, useRef, useState } from "react";

import { MarkdownRenderer } from "@/components/markdown-renderer";

type MarkdownEditorProps = {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  required?: boolean;
  helperText?: string;
};

const toolbarActions = [
  { label: "Fet", before: "**", after: "**" },
  { label: "Kursiv", before: "_", after: "_" },
  { label: "Lenke", before: "[", after: "](https://)" },
  { label: "Tittel", before: "## ", after: "" },
  { label: "Liste", before: "- ", after: "" },
] as const;

export function MarkdownEditor({
  label,
  name,
  defaultValue = "",
  rows = 10,
  required,
  helperText,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const id = useId();
  const [value, setValue] = useState(defaultValue);

  const applyFormatting = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selection = value.slice(start, end);
    const nextValue = `${value.slice(0, start)}${before}${selection}${after}${value.slice(
      end
    )}`;

    textarea.value = nextValue;
    setValue(nextValue);
    textarea.focus();
    const cursor = start + before.length + selection.length + after.length;
    textarea.setSelectionRange(cursor, cursor);
  };

  return (
    <label className="space-y-2 text-sm text-slate-200" htmlFor={id}>
      <span>{label}</span>
      <div className="flex flex-wrap gap-2">
        {toolbarActions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => applyFormatting(action.before, action.after)}
            className="rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
          >
            {action.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          required={required}
          rows={rows}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
        />
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-200">
          {value.trim().length > 0 ? (
            <MarkdownRenderer content={value} className="space-y-4" />
          ) : (
            <p className="text-sm text-slate-400">
              Forhåndsvisningen oppdateres mens du skriver.
            </p>
          )}
        </div>
      </div>
      <p className="text-xs text-slate-400">
        {helperText ??
          "Markdown støttes. Bruk **fet**, _kursiv_, [lenke](https://), lister og se forhåndsvisningen."}
      </p>
    </label>
  );
}
