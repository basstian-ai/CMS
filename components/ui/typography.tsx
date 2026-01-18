import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type HeadingProps = PropsWithChildren<{ className?: string }>;

type TextProps = PropsWithChildren<{ className?: string }>;

export function Heading({ className, children }: HeadingProps) {
  return (
    <h1 className={cn("text-4xl font-semibold tracking-tight text-slate-900", className)}>
      {children}
    </h1>
  );
}

export function Subheading({ className, children }: HeadingProps) {
  return (
    <h2 className={cn("text-2xl font-semibold tracking-tight text-slate-900", className)}>
      {children}
    </h2>
  );
}

export function BodyText({ className, children }: TextProps) {
  return (
    <p className={cn("text-base leading-relaxed text-slate-600", className)}>
      {children}
    </p>
  );
}
