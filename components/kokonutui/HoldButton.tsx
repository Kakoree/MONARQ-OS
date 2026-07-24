"use client";

/**
 * Hold-to-confirm interaction pattern adapted from KokonutUI's Hold Button
 * (MIT, https://kokonutui.com) — rebuilt from scratch on MONARQ's own
 * button/token system rather than pulled in via their registry, so it
 * carries none of their color variants or shadcn dependency.
 */

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

export function HoldButton({
  onConfirm,
  holdDurationMs = 650,
  idleLabel,
  holdingLabel = "Keep holding…",
  className,
  disabled,
}: {
  onConfirm: () => void;
  holdDurationMs?: number;
  idleLabel: ReactNode;
  holdingLabel?: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const [isHolding, setIsHolding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    if (disabled) return;
    setIsHolding(true);
    timerRef.current = setTimeout(() => {
      setIsHolding(false);
      onConfirm();
    }, holdDurationMs);
  }

  function cancel() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsHolding(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
      e.preventDefault();
      start();
    }
  }

  function handleKeyUp(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "Enter" || e.key === " ") cancel();
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={start}
      onMouseUp={cancel}
      onMouseLeave={cancel}
      onTouchStart={start}
      onTouchEnd={cancel}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "relative overflow-hidden rounded-md px-2.5 py-1 text-xs text-stone transition-colors disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold",
        isHolding ? "text-danger" : "hover:text-danger",
        className
      )}
    >
      <motion.span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-danger/20"
        style={{ originX: 0, width: "100%" }}
        initial={false}
        animate={{ scaleX: isHolding ? 1 : 0 }}
        transition={{
          duration: isHolding ? holdDurationMs / 1000 : 0.15,
          ease: isHolding ? "linear" : "easeOut",
        }}
      />
      <span className="relative z-10">{isHolding ? holdingLabel : idleLabel}</span>
    </button>
  );
}
