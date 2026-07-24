"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

// Wraps a linked Card in a restrained hover lift + tap settle. Layered on
// top of the existing CSS border-color hover, not a replacement for it.
export function InteractiveCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -3 }}
      whileTap={{ y: 0, scale: 0.99 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
