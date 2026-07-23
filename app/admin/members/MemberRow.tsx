import { Badge } from "@/components/ui/Badge";
import { setMemberStatus } from "./actions";
import type { AdminMemberRow } from "@/lib/admin";
import { cn } from "@/lib/cn";

export function MemberRow({
  member,
  isSelf,
}: {
  member: AdminMemberRow;
  isSelf: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div>
        <p className="text-sm text-paper">
          {member.displayName ?? "Member"}{" "}
          {isSelf && <span className="text-stone">(you)</span>}
        </p>
        <p className="text-xs text-stone">{member.userId}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge>{member.role}</Badge>
        <Badge
          className={cn(member.status === "active" && "border-gold/40 text-gold")}
        >
          {member.status}
        </Badge>
        {!isSelf && (
          <div className="flex gap-2">
            {member.status !== "active" && (
              <form action={setMemberStatus.bind(null, member.userId, "active")}>
                <button
                  type="submit"
                  className="text-xs text-stone transition-colors hover:text-gold"
                >
                  Activate
                </button>
              </form>
            )}
            {member.status !== "suspended" && (
              <form
                action={setMemberStatus.bind(null, member.userId, "suspended")}
              >
                <button
                  type="submit"
                  className="text-xs text-stone transition-colors hover:text-danger"
                >
                  Suspend
                </button>
              </form>
            )}
            {member.status !== "revoked" && (
              <form action={setMemberStatus.bind(null, member.userId, "revoked")}>
                <button
                  type="submit"
                  className="text-xs text-stone transition-colors hover:text-danger"
                >
                  Revoke
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
