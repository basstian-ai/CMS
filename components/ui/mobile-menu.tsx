"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/nyheter", label: "Nyheter" },
  { href: "/kalender", label: "Kalender" },
  { href: "/podcast", label: "Podcast" },
  { href: "/kontakt", label: "Kontakt" },
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Lukk meny" : "Åpne meny"}
        aria-expanded={open}
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
        <div className="fixed inset-0 top-[73px] z-40 bg-black/35">
          <nav className="container-layout mt-4 space-y-2 rounded-2xl border border-[#e6ddcf] bg-[#fffaf3] p-4 shadow-xl">
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
      ) : null}
    </div>
  );
}
