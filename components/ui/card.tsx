import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-border bg-surface p-6 shadow-soft",
        className
      )}
    >
      {children}
    </div>
  );
}
