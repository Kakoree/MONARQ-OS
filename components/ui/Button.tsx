import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-paper text-ink hover:opacity-90 active:opacity-80",
  secondary:
    "bg-transparent text-paper border border-line hover:border-gold/60 hover:text-gold",
  ghost: "bg-transparent text-stone hover:text-paper",
};

// Exported so non-<button> elements (e.g. an external <a> link styled as a
// button) can share identical styling without nesting interactive elements
// inside a Button.
export function buttonClassName(
  variant: ButtonVariant = "primary",
  className?: string
): string {
  return cn(
    "inline-flex items-center justify-center rounded-md px-4 py-2.5 text-sm font-medium tracking-wide transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
    variantStyles[variant],
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button ref={ref} className={buttonClassName(variant, className)} {...props} />
  )
);
Button.displayName = "Button";
