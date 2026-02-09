"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

const baseClasses =
  "block rounded-xl border border-transparent px-3 py-2 text-slate-300 transition";
const hoverClasses = "hover:border-slate-800 hover:bg-slate-900";
const activeClasses = "border-slate-700 bg-slate-900 text-white";

type NavItem = { href: Route; label: string };

type AdminNavProps = {
  items: NavItem[];
};

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ items }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2 text-sm">
      {items.map((item) => {
        const active = pathname ? isActivePath(pathname, item.href) : false;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${baseClasses} ${
              active ? activeClasses : hoverClasses
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
