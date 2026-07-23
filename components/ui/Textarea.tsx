import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full resize-none rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-paper outline-none transition-colors placeholder:text-stone/70 focus-visible:border-gold disabled:opacity-40",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
