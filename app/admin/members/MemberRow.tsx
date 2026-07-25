"use client";

import { useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { HoldButton } from "@/components/kokonutui/HoldButton";
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
  const activateFormRef = useRef<HTMLFormElement>(null);
  const suspendFormRef = useRef<HTMLFormElement>(null);
  const revokeFormRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div>
        <p className="text-sm text-paper">
          {member.displayName ?? "Member"}{" "}
          {isSelf && <span className="text-stone">(you)</span>}
          {member.isTestAccount && (
            <span className="ml-2 font-sans text-xs text-stone">
              test account — excluded from all stats
            </span>
          )}
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
              <form
                ref={activateFormRef}
                action={setMemberStatus.bind(null, member.userId, "active")}
              >
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
                ref={suspendFormRef}
                action={setMemberStatus.bind(null, member.userId, "suspended")}
              >
                <HoldButton
                  idleLabel="Suspend"
                  holdingLabel="Keep holding…"
                  onConfirm={() => suspendFormRef.current?.requestSubmit()}
                />
              </form>
            )}
            {member.status !== "revoked" && (
              <form
                ref={revokeFormRef}
                action={setMemberStatus.bind(null, member.userId, "revoked")}
              >
                <HoldButton
                  idleLabel="Revoke"
                  holdingLabel="Keep holding…"
                  onConfirm={() => revokeFormRef.current?.requestSubmit()}
                />
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
