import Link from "next/link";
import { formatRelativeTime } from "@/lib/format";
import type { AuditLogPreviewEntry } from "@/lib/analytics";

export function RecentActivity({ entries }: { entries: AuditLogPreviewEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-stone">No admin actions recorded yet.</p>;
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-mono text-xs text-paper">{entry.action}</p>
              <p className="text-xs text-stone">
                {entry.actorName}
                {entry.targetTable && ` · ${entry.targetTable}`}
              </p>
            </div>
            <span className="shrink-0 text-xs text-stone">
              {formatRelativeTime(entry.createdAt)}
            </span>
          </li>
        ))}
      </ul>
      <Link href="/admin/audit-log" className="block text-xs text-stone hover:text-paper">
        View full audit log →
      </Link>
    </div>
  );
}
