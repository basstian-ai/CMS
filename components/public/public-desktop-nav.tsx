"use client";

import { usePathname } from "next/navigation";

import { TrackedLink } from "@/components/public/tracked-link";
import { cn } from "@/lib/utils";
import { isNavItemActive, publicNavItems } from "@/lib/site/navigation";

export function PublicDesktopNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="hidden items-center gap-1 lg:flex" aria-label="Hovedmeny">
      {publicNavItems.map((item) => {
        const isActive = isNavItemActive(pathname, item.href);

        return (
          <TrackedLink
            key={item.href}
            href={item.href}
            eventName="nav_click"
            eventPayload={{
              location: "desktop_header",
              target: item.href,
              label: item.label,
            }}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
              isActive
                ? "bg-accent-soft text-ink"
                : "text-ink-muted hover:bg-surface-strong hover:text-ink"
            )}
          >
            {item.label}
          </TrackedLink>
        );
      })}
    </nav>
  );
}
