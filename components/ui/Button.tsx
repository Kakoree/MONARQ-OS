"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { motion } from "motion/react";
import { buttonClassName, type ButtonVariant } from "./buttonClassName";

export type { ButtonVariant };

// motion.button's drag/animation event props are typed differently than
// React's DOM ones, so the overlapping handlers are dropped from here —
// this component doesn't use them, and Button is a leaf, not a passthrough.
type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

interface ButtonProps extends NativeButtonProps {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      disabled={disabled}
      className={buttonClassName(variant, className)}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.12 }}
      {...props}
    />
  )
);
Button.displayName = "Button";
