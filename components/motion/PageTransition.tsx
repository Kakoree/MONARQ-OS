"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

// Lives in a route group's template.tsx, which Next.js remounts on every
// navigation within that segment — the correct hook point for a per-page
// entrance since (unlike layout.tsx) it re-runs without an exit animation
// to coordinate against App Router's streaming.
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
