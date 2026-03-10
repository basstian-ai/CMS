import Link from "next/link";
import type { ComponentProps } from "react";

import { TrackedLink } from "@/components/public/tracked-link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FeatureTileProps = {
  title: string;
  description: string;
  href: ComponentProps<typeof Link>["href"];
  ctaLabel?: string;
  className?: string;
};

export function FeatureTile({
  title,
  description,
  href,
  ctaLabel = "Les mer",
  className,
}: FeatureTileProps) {
  const trackingTarget =
    typeof href === "string" ? href : href.pathname?.toString() ?? "unknown";

  return (
    <article
      className={cn(
        "group flex h-full flex-col gap-5 rounded-3xl border border-border bg-surface p-6 shadow-soft transition-transform duration-300 hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="space-y-3">
        <h3 className="font-display text-2xl text-ink">{title}</h3>
        <p className="text-base leading-relaxed text-ink-muted">{description}</p>
      </div>
      <TrackedLink
        href={href}
        eventName="cta_click"
        eventPayload={{ location: "feature_tile", target: trackingTarget, label: title }}
        className={cn(buttonVariants("ghost"), "mt-auto self-start")}
      >
        {ctaLabel}
      </TrackedLink>
    </article>
  );
}
