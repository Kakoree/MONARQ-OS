import Link from "next/link";
import { getMentorsAdmin } from "@/lib/admin";
import { getMentorLoad } from "@/lib/mentor-analytics";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { approveMentor, deactivateMentor } from "./actions";

export default async function AdminMentorsPage() {
  const [mentors, load] = await Promise.all([getMentorsAdmin(), getMentorLoad()]);
  const pending = mentors.filter((m) => !m.isApproved);
  const approved = mentors.filter((m) => m.isApproved);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-paper">Mentors</h1>
          <p className="mt-1 text-sm text-stone">
            Approve applications and manage the mentor directory. Assign a
            mentor to a teaching track from the{" "}
            <Link href="/admin/teachings" className="text-gold hover:underline">
              Teachings
            </Link>{" "}
            page.
          </p>
        </div>
        <Link
          href="/admin/mentors/analytics"
          className="text-xs text-stone transition-colors hover:text-gold"
        >
          Analytics →
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
          Pending applications {pending.length > 0 && `(${pending.length})`}
        </h2>
        {pending.length === 0 ? (
          <Card>
            <p className="text-sm text-stone">No pending applications.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {pending.map((mentor) => (
              <Card key={mentor.id} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-paper">
                    {mentor.displayName}
                  </p>
                  <form action={approveMentor.bind(null, mentor.id, mentor.userId)}>
                    <button
                      type="submit"
                      className="text-xs text-stone transition-colors hover:text-gold"
                    >
                      Approve
                    </button>
                  </form>
                </div>
                <p className="text-sm text-stone">{mentor.headline}</p>
                <p className="text-sm text-paper/90">{mentor.bio}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
          Approved mentors
        </h2>
        {approved.length === 0 ? (
          <Card>
            <p className="text-sm text-stone">No approved mentors yet.</p>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-md border border-line">
            <div className="divide-y divide-line">
              {approved.map((mentor) => (
                <div
                  key={mentor.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-paper">{mentor.displayName}</p>
                    <p className="text-xs text-stone">
                      {mentor.headline}
                      {(() => {
                        const l = load.get(mentor.id);
                        if (!l || (l.pendingCount === 0 && l.confirmedCount === 0)) return null;
                        return ` · ${l.pendingCount} pending, ${l.confirmedCount} upcoming`;
                      })()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        mentor.isAcceptingRequests && "border-gold/40 text-gold"
                      )}
                    >
                      {mentor.isAcceptingRequests ? "Accepting" : "Paused"}
                    </Badge>
                    <form action={deactivateMentor.bind(null, mentor.id)}>
                      <button
                        type="submit"
                        className="text-xs text-stone transition-colors hover:text-danger"
                      >
                        Deactivate
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
