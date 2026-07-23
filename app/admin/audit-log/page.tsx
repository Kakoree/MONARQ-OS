import { getAuditLog } from "@/lib/admin";
import { Card } from "@/components/ui/Card";
import { formatRelativeTime } from "@/lib/format";

export default async function AdminAuditLogPage() {
  const entries = await getAuditLog();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-paper">Audit Log</h1>
        <p className="mt-1 text-sm text-stone">
          Admin actions only, most recent first. Immutable — nothing here can
          be edited or deleted through the app.
        </p>
      </div>

      {entries.length === 0 ? (
        <Card>
          <p className="text-sm text-stone">No admin actions recorded yet.</p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-md border border-line">
          <div className="divide-y divide-line">
            {entries.map((entry) => (
              <div key={entry.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-paper">
                    {entry.action}
                  </span>
                  <span className="text-xs text-stone">
                    {formatRelativeTime(entry.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone">
                  {entry.actorName}
                  {entry.targetTable && ` · ${entry.targetTable}`}
                  {entry.targetId && ` · ${entry.targetId}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
