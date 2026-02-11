import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

const buttonBaseClasses =
  "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-[#fffaf3] text-stone-900 border border-[#e6ddcf] hover:bg-[#f2e9dc]",
  ghost: "text-stone-700 hover:bg-[#efe5d8]",
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
