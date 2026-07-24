"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

// Single place that opts every motion.* component and layout animation
// into the OS-level reduced-motion preference, so individual components
// don't each need their own useReducedMotion() branch.
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </MotionConfig>
  );
}
