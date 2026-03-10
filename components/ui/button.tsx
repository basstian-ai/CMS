import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline";
};

const buttonBaseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-strong/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-accent text-white shadow-soft hover:bg-accent-strong",
  secondary:
    "border border-border bg-surface text-ink hover:border-accent-soft hover:bg-canvas-muted",
  ghost: "text-ink-muted hover:bg-canvas-muted hover:text-ink",
  outline: "border border-accent/45 bg-transparent text-ink hover:bg-accent-soft/60",
};

export function buttonVariants(variant: NonNullable<ButtonProps["variant"]> = "primary") {
  return cn(buttonBaseClasses, variants[variant]);
}

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants(variant), className)}
      {...props}
    />
  );
}
