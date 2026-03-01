"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useId, useRef, useState } from "react";

const navItems = [
  { href: "/nyheter", label: "Nyheter" },
  { href: "/kalender", label: "Kalender" },
  { href: "/podcast", label: "Podcast" },
  { href: "/kontakt", label: "Kontakt" },
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const dialogId = useId();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const triggerElement = triggerRef.current;
    const focusableSelector =
      'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

    const getFocusableElements = () => {
      const dialog = dialogRef.current;
      if (!dialog) {
        return [] as HTMLElement[];
      }
      return Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      );
    };

    const focusableElements = getFocusableElements();
    const firstFocusable = focusableElements[0];
    (firstFocusable ?? dialogRef.current)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = dialogRef.current;
      if (!dialog) {
        return;
      }

      const elements = getFocusableElements();
      if (!elements.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      const activeElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      if (!activeElement || !dialog.contains(activeElement)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      triggerElement?.focus();
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? "Lukk meny" : "Åpne meny"}
        aria-expanded={open}
        aria-controls={dialogId}
        aria-haspopup="dialog"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e6ddcf] bg-[#fffaf3] text-stone-700"
      >
        <span className="sr-only">{open ? "Lukk meny" : "Åpne meny"}</span>
        <span className="space-y-1.5">
          <span
            className={`block h-0.5 w-4 bg-current transition ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`block h-0.5 w-4 bg-current transition ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-0.5 w-4 bg-current transition ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 top-[73px] z-40 bg-black/35"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            id={dialogId}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobilmeny"
            tabIndex={-1}
            className="container-layout mt-4 rounded-2xl border border-[#e6ddcf] bg-[#fffaf3] p-4 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                Meny
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[#d9cfbf] bg-white px-3 py-1 text-xs font-semibold text-stone-700 transition hover:bg-[#efe5d8]"
              >
                Lukk
              </button>
            </div>
            <nav className="space-y-2" aria-label="Hovedmeny">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-2 text-base text-stone-700 hover:bg-[#efe5d8]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/gi"
                onClick={() => setOpen(false)}
                className="mt-2 block rounded-full bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white"
              >
                Gi
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
