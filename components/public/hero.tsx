import Image from "next/image";
import type { Route } from "next";

import { TrackedLink } from "@/components/public/tracked-link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeroAction = {
  href: Route;
  label: string;
  eventLabel: string;
  variant?: "primary" | "secondary" | "ghost" | "outline";
};

type HeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryAction: HeroAction;
  secondaryAction?: HeroAction;
  imageSrc?: string | null;
  imageAlt?: string;
  className?: string;
};

export function Hero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  imageSrc,
  imageAlt = "",
  className,
}: HeroProps) {
  return (
    <section className={cn("relative overflow-hidden", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(138,85,34,0.17),transparent_55%),radial-gradient(circle_at_85%_10%,rgba(104,61,27,0.12),transparent_45%)]"
      />
      <div className="container-layout relative grid gap-10 py-14 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          {eyebrow ? (
            <p className="inline-flex rounded-full border border-accent-soft bg-surface px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-accent-strong">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-display text-4xl leading-tight text-ink md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-ink-muted">{description}</p>
          <div className="flex flex-wrap gap-3">
            <TrackedLink
              href={primaryAction.href}
              eventName="cta_click"
              eventPayload={{ location: "hero", target: primaryAction.eventLabel }}
              className={buttonVariants(primaryAction.variant ?? "primary")}
            >
              {primaryAction.label}
            </TrackedLink>
            {secondaryAction ? (
              <TrackedLink
                href={secondaryAction.href}
                eventName="cta_click"
                eventPayload={{ location: "hero", target: secondaryAction.eventLabel }}
                className={buttonVariants(secondaryAction.variant ?? "secondary")}
              >
                {secondaryAction.label}
              </TrackedLink>
            ) : null}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-surface p-3 shadow-soft">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] bg-canvas-muted">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 44vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(140deg,#efe5d8,#d6b792)]" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
