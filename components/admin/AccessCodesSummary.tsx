import Link from "next/link";
import type { AccessCodeSummary } from "@/lib/analytics";

export function AccessCodesSummary({ summary }: { summary: AccessCodeSummary }) {
  return (
    <div className="space-y-3">
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-stone">Active codes</dt>
          <dd className="text-paper">{summary.activeCount}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-stone">Total redemptions</dt>
          <dd className="text-paper">{summary.totalRedemptions}</dd>
        </div>
        {summary.mostUsed && (
          <div className="flex items-center justify-between">
            <dt className="text-stone">Most used</dt>
            <dd className="font-mono text-xs text-gold">
              {summary.mostUsed.code} ({summary.mostUsed.usesCount}/
              {summary.mostUsed.maxUses})
            </dd>
          </div>
        )}
      </dl>
      <Link
        href="/admin/access-codes"
        className="block text-xs text-stone hover:text-paper"
      >
        Manage access codes →
      </Link>
    </div>
  );
}
