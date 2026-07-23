import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-paper outline-none transition-colors placeholder:text-stone/70 focus-visible:border-gold disabled:opacity-40",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
