"use client";

import { motion } from "motion/react";
import { toggleReaction } from "@/app/(app)/community/actions";
import { cn } from "@/lib/cn";

export function ReactionButton({
  postId,
  count,
  hasReacted,
}: {
  postId: string;
  count: number;
  hasReacted: boolean;
}) {
  return (
    <form action={toggleReaction.bind(null, postId)}>
      <motion.button
        type="submit"
        whileTap={{ scale: 0.9 }}
        aria-pressed={hasReacted}
        className={cn(
          "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
          hasReacted
            ? "border-gold bg-gold-dim text-gold"
            : "border-line text-stone hover:border-gold/60 hover:text-gold"
        )}
      >
        <motion.span
          aria-hidden
          animate={hasReacted ? { scale: [1, 1.35, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          ✦
        </motion.span>
        <span>{count}</span>
      </motion.button>
    </form>
  );
}
