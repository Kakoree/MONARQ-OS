import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { MentorshipRequestItem } from "@/lib/mentors";
import { cancelRequestAction } from "@/app/(app)/mentors/actions";

export function MyMentorshipRequests({ requests }: { requests: MentorshipRequestItem[] }) {
  const active = requests.filter((r) => r.status === "pending" || r.status === "confirmed");

  if (active.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
        Your requests
      </h2>
      {active.map((r) => (
        <Card key={r.id} className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-paper">{r.otherDisplayName}</p>
            {r.status === "confirmed" && r.scheduledAt && (
              <p className="text-xs text-stone">
                {new Date(r.scheduledAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
                {r.joinUrl && (
                  <>
                    {" · "}
                    <a href={r.joinUrl} className="text-gold hover:underline">
                      Join link
                    </a>
                  </>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn(r.status === "confirmed" && "border-gold/40 text-gold")}>
              {r.status}
            </Badge>
            <form action={cancelRequestAction.bind(null, r.id)}>
              <button type="submit" className="text-xs text-stone hover:text-danger">
                Cancel
              </button>
            </form>
          </div>
        </Card>
      ))}
    </div>
  );
}
