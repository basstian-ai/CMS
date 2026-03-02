import Image from "next/image";
import type { ReactNode } from "react";
import type { UrlObject } from "url";

import { TrackedLink } from "@/components/public/tracked-link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContentCardProps = {
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  href: string | UrlObject;
  hrefLabel: string;
  trackingLabel?: string;
  imageSrc?: string | null;
  imageAlt?: string;
  variant?: "news" | "event" | "podcast";
  className?: string;
};

const variantClassNames: Record<NonNullable<ContentCardProps["variant"]>, string> = {
  news: "",
  event: "bg-[linear-gradient(180deg,rgba(255,250,243,1),rgba(248,241,231,1))]",
  podcast: "bg-[linear-gradient(180deg,rgba(255,250,243,1),rgba(245,237,226,1))]",
};

export function ContentCard({
  title,
  description,
  meta,
  href,
  hrefLabel,
  trackingLabel,
  imageSrc,
  imageAlt = "",
  variant = "news",
  className,
}: ContentCardProps) {
  const trackingTarget =
    typeof href === "string" ? href : href.pathname?.toString() ?? "unknown";

  return (
    <article
      className={cn(
        "group flex h-full flex-col gap-4 rounded-3xl border border-border bg-surface p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated",
        variantClassNames[variant],
        className,
      )}
    >
      {imageSrc ? (
        <div className="relative h-44 overflow-hidden rounded-2xl border border-border/70 bg-canvas-muted">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 32vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-3">
        {meta ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">
            {meta}
          </p>
        ) : null}
        <h3 className="font-display text-2xl leading-tight text-ink">{title}</h3>
        {description ? (
          <p className="text-base leading-relaxed text-ink-muted">{description}</p>
        ) : null}
      </div>

      <TrackedLink
        href={href}
        eventName="card_click"
        eventPayload={{
          location: "content_card",
          target: trackingTarget,
          label:
            trackingLabel ??
            (typeof title === "string" ? title : hrefLabel),
          variant,
        }}
        className={cn(buttonVariants("ghost"), "mt-auto self-start")}
      >
        {hrefLabel}
      </TrackedLink>
    </article>
  );
}
