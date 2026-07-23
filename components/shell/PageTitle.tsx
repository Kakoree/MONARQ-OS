"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";

export function PageTitle() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => item.href === pathname);

  return (
    <span className="text-sm text-stone">{current?.label ?? "MONARQ"}</span>
  );
}
