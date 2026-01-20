"use client";

import { useId, useRef } from "react";

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
      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        required={required}
        rows={rows}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
      />
      <p className="text-xs text-slate-400">
        {helperText ??
          "Markdown støttes. Bruk **fet**, _kursiv_, [lenke](https://) og lister."}
      </p>
    </label>
  );
}
