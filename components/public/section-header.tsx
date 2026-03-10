import type { PropsWithChildren, ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeaderProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  actions?: ReactNode;
}>;

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  actions,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:items-center",
        className,
      )}
    >
      <div className={cn("max-w-3xl space-y-3", align === "center" && "text-center")}>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-strong">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-3xl leading-tight text-ink md:text-4xl">{title}</h2>
        {description ? <p className="text-base leading-relaxed text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
