"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { TrackedLink } from "@/components/public/tracked-link";
import { buttonVariants } from "@/components/ui/button";
import {
  isNavItemActive,
  publicNavItems,
  publicPrimaryCta,
} from "@/lib/site/navigation";
import { cn } from "@/lib/utils";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const dialogId = useId();
  const pathname = usePathname() ?? "/";

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

      return Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
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
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-ink-muted"
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
          className="fixed inset-0 top-[74px] z-40 bg-ink/35 px-5"
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
            className="container-layout mt-4 rounded-3xl border border-border bg-surface p-5 shadow-elevated"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-strong">
                Meny
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border bg-surface-strong px-3 py-1 text-xs font-semibold text-ink-muted transition hover:bg-canvas-muted"
              >
                Lukk
              </button>
            </div>
            <nav className="space-y-2" aria-label="Hovedmeny">
              {publicNavItems.map((item) => {
                const isActive = isNavItemActive(pathname, item.href);

                return (
                  <TrackedLink
                    key={item.href}
                    href={item.href}
                    eventName="nav_click"
                    eventPayload={{
                      location: "mobile_menu",
                      target: item.href,
                      label: item.label,
                    }}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "block rounded-xl px-3 py-2 text-base transition",
                      isActive
                        ? "bg-accent-soft text-ink"
                        : "text-ink-muted hover:bg-canvas-muted hover:text-ink",
                    )}
                  >
                    {item.label}
                  </TrackedLink>
                );
              })}
              <TrackedLink
                href={publicPrimaryCta.href}
                eventName="cta_click"
                eventPayload={{ location: "mobile_menu", target: publicPrimaryCta.href }}
                onClick={() => setOpen(false)}
                className={cn(buttonVariants("primary"), "mt-2 w-full")}
              >
                {publicPrimaryCta.label}
              </TrackedLink>
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  );
}
