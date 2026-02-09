"use client";

import { useEffect, useRef, useState } from "react";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type SlugFieldProps = {
  initialSlug?: string | null;
  slugName: string;
  titleInputName: string;
  required?: boolean;
};

export function SlugField({
  initialSlug,
  slugName,
  titleInputName,
  required,
}: SlugFieldProps) {
  const [isEditable, setIsEditable] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const slugInput = inputRef.current;
    if (!slugInput) {
      return;
    }
    const form = slugInput.form;
    if (!form) {
      return;
    }
    const titleInput = form.querySelector<HTMLInputElement>(
      `input[name="${titleInputName}"]`
    );
    if (!titleInput) {
      return;
    }
    const handleTitleChange = () => {
      if (slugInput.value.trim() !== "") {
        return;
      }
      slugInput.value = slugify(titleInput.value);
    };
    handleTitleChange();
    titleInput.addEventListener("input", handleTitleChange);
    return () => {
      titleInput.removeEventListener("input", handleTitleChange);
    };
  }, [titleInputName]);

  return (
    <label className="space-y-2 text-sm text-slate-200">
      <span className="flex items-center justify-between gap-2">
        Slug
        <button
          type="button"
          onClick={() => setIsEditable((prev) => !prev)}
          className="text-xs font-semibold text-slate-400 hover:text-white"
        >
          {isEditable ? "Lock slug" : "Edit slug"}
        </button>
      </span>
      <input
        ref={inputRef}
        name={slugName}
        required={required}
        defaultValue={initialSlug ?? ""}
        readOnly={!isEditable}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2"
      />
    </label>
  );
}
