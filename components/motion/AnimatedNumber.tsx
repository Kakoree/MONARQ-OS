"use client";

import { useEffect, useRef } from "react";
import { animate, useMotionValue, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

// Counts up to `value` on mount/update. Renders the plain number for SSR
// and non-JS clients, then animates client-side — never blocks on motion.
export function AnimatedNumber({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      if (ref.current) ref.current.textContent = String(value);
      return;
    }

    const controls = animate(motionValue, value, {
      duration: 0.8,
      ease: EASE,
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = String(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [value, motionValue, prefersReducedMotion]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
