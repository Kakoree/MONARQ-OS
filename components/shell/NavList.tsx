"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { NAV_ITEMS } from "@/lib/nav";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

export function NavList({
  orientation = "vertical",
}: {
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        orientation === "vertical"
          ? "flex flex-col gap-1"
          : "flex gap-2 overflow-x-auto"
      )}
    >
      {NAV_ITEMS.map((item) => {
        if (!item.enabled) {
          return (
            <div
              key={item.href}
              title="Coming soon"
              className={cn(
                "flex shrink-0 items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm text-stone/50",
                orientation === "horizontal" && "whitespace-nowrap"
              )}
            >
              {item.label}
              <Badge>Soon</Badge>
            </div>
          );
        }

        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex shrink-0 items-center rounded-md px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
              orientation === "horizontal" && "whitespace-nowrap",
              isActive
                ? "bg-surface-raised text-paper"
                : "text-paper/80 hover:bg-surface-raised hover:text-paper"
            )}
          >
            {isActive && (
              <motion.span
                layoutId={`nav-indicator-${orientation}`}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                className={cn(
                  "absolute rounded-full bg-gold",
                  orientation === "vertical"
                    ? "left-0 top-1/2 h-4 w-[2px] -translate-y-1/2"
                    : "inset-x-3 bottom-0 h-[2px]"
                )}
              />
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
