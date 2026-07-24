import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/format";
import type { MentorshipRequestItem } from "@/lib/mentors";
import {
  cancelRequestAction,
  completeRequestAction,
  confirmRequestAction,
  declineRequestAction,
} from "@/app/(app)/mentors/actions";

export function MentorInbox({ requests }: { requests: MentorshipRequestItem[] }) {
  const pending = requests.filter((r) => r.status === "pending");
  const confirmed = requests.filter((r) => r.status === "confirmed");
  const past = requests.filter((r) =>
    ["completed", "declined", "cancelled"].includes(r.status)
  );

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-stone">
            New requests
          </h3>
          {pending.map((r) => (
            <Card key={r.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-paper">{r.otherDisplayName}</p>
                <span className="text-xs text-stone">{formatRelativeTime(r.createdAt)}</span>
              </div>
              {r.message && <p className="text-sm text-stone">{r.message}</p>}
              <form
                action={confirmRequestAction.bind(null, r.id)}
                className="flex flex-wrap items-end gap-2"
              >
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-stone">
                    Session time
                  </label>
                  <Input name="scheduled_at" type="datetime-local" required className="w-52" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider text-stone">
                    Join link
                  </label>
                  <Input name="join_url" type="url" placeholder="https://..." required className="w-52" />
                </div>
                <Button type="submit" className="px-3 py-1.5 text-xs">
                  Confirm
                </Button>
              </form>
              <form action={declineRequestAction.bind(null, r.id)}>
                <button type="submit" className="text-xs text-stone hover:text-danger">
                  Decline
                </button>
              </form>
            </Card>
          ))}
        </div>
      )}

      {confirmed.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-stone">
            Upcoming sessions
          </h3>
          {confirmed.map((r) => (
            <Card key={r.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-paper">{r.otherDisplayName}</p>
                <Badge className="border-gold/40 text-gold">
                  {r.scheduledAt &&
                    new Date(r.scheduledAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                </Badge>
              </div>
              {r.joinUrl && (
                <a href={r.joinUrl} className="text-xs text-gold hover:underline">
                  {r.joinUrl}
                </a>
              )}
              <div className="flex items-center gap-3">
                <form action={completeRequestAction.bind(null, r.id)}>
                  <button type="submit" className="text-xs text-stone hover:text-gold">
                    Mark completed
                  </button>
                </form>
                <form action={cancelRequestAction.bind(null, r.id)}>
                  <button type="submit" className="text-xs text-stone hover:text-danger">
                    Cancel
                  </button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-stone">History</h3>
          <div className="overflow-hidden rounded-md border border-line">
            <div className="divide-y divide-line">
              {past.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-paper/80">{r.otherDisplayName}</span>
                  <Badge>{r.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
