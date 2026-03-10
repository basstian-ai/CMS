import type { Route } from "next";

import { TrackedLink } from "@/components/public/tracked-link";

type BreadcrumbItem = {
  label: string;
  href?: Route;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items.length) {
    return null;
  }

  return (
    <nav aria-label="Brødsmuler">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isCurrent ? (
                <TrackedLink
                  href={item.href}
                  eventName="nav_click"
                  eventPayload={{ location: "breadcrumb", target: item.href, label: item.label }}
                  className="rounded-sm underline-offset-4 transition hover:text-ink hover:underline"
                >
                  {item.label}
                </TrackedLink>
              ) : (
                <span aria-current={isCurrent ? "page" : undefined} className="text-ink">
                  {item.label}
                </span>
              )}
              {!isCurrent ? <span className="text-border">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
