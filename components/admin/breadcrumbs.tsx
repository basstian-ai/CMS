"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UrlObject } from "url";

type Crumb = {
  label: string;
  href?: UrlObject;
};

const labelMap: Record<string, string> = {
  admin: "Admin",
  posts: "Posts",
  events: "Arrangementer",
  sermons: "Taler",
  pages: "Sider",
  media: "Media",
  new: "New",
};

function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0 || segments[0] !== "admin") {
    return [];
  }

  const crumbs: Crumb[] = [];
  let currentPath = "";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    let label = labelMap[segment];

    if (!label) {
      const previous = segments[index - 1];
      if (previous === "posts") {
        label = "Edit";
      } else {
        label = segment;
      }
    }

    const isLast = index === segments.length - 1;
    crumbs.push({
      label,
      href: isLast ? undefined : { pathname: currentPath },
    });
  });

  return crumbs;
}

export function AdminBreadcrumbs() {
  const pathname = usePathname();

  if (!pathname) {
    return null;
  }

  const crumbs = buildCrumbs(pathname);

  if (crumbs.length <= 1) {
    return (
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin</p>
    );
  }

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
        {crumbs.map((crumb, index) => (
          <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
            {crumb.href ? (
              <Link href={crumb.href} className="transition hover:text-slate-200">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-slate-200">{crumb.label}</span>
            )}
            {index < crumbs.length - 1 && (
              <span aria-hidden="true" className="text-slate-700">
                →
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
