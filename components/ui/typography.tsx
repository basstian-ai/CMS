import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type HeadingProps = PropsWithChildren<{ className?: string }>;

type TextProps = PropsWithChildren<{ className?: string }>;

export function Heading({ className, children }: HeadingProps) {
  return (
    <h1 className={cn("font-display text-4xl tracking-tight text-ink md:text-5xl", className)}>
      {children}
    </h1>
  );
}

export function Subheading({ className, children }: HeadingProps) {
  return (
    <h2 className={cn("font-display text-3xl tracking-tight text-ink", className)}>
      {children}
    </h2>
  );
}

export function BodyText({ className, children }: TextProps) {
  return (
    <p className={cn("text-base leading-relaxed text-ink-muted md:text-lg", className)}>
      {children}
    </p>
  );
}
