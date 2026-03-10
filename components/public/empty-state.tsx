import type { Route } from "next";

import { TrackedLink } from "@/components/public/tracked-link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: Route;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-dashed border-border bg-surface p-8 text-center shadow-soft",
        className,
      )}
    >
      <div className="mx-auto max-w-xl space-y-3">
        <h3 className="font-display text-2xl text-ink">{title}</h3>
        <p className="text-base leading-relaxed text-ink-muted">{description}</p>
      </div>
      {actionLabel && actionHref ? (
        <TrackedLink
          href={actionHref}
          eventName="cta_click"
          eventPayload={{ location: "empty_state", target: actionHref, label: actionLabel }}
          className={cn(buttonVariants("secondary"), "mt-6")}
        >
          {actionLabel}
        </TrackedLink>
      ) : null}
    </div>
  );
}
