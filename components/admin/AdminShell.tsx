import Link from "next/link";
import type { ReactNode } from "react";

const ADMIN_NAV = [
  { label: "Members", href: "/admin/members" },
  { label: "Access Codes", href: "/admin/access-codes" },
  { label: "Moderation", href: "/admin/moderation" },
  { label: "Audit Log", href: "/admin/audit-log" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-paper">
      <header className="border-b border-line px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg tracking-[0.15em] text-gold">
            MONARQ ADMIN
          </span>
          <Link href="/home" className="text-xs text-stone hover:text-paper">
            ← Back to app
          </Link>
        </div>
        <nav className="mt-4 flex gap-2 overflow-x-auto">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs text-paper/80 transition-colors hover:border-gold/60 hover:text-gold"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
