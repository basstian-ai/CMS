import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#e6ddcf] bg-white p-6 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
