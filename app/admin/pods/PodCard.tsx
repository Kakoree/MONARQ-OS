"use client";

import { useActionState, useRef, useState } from "react";
import {
  updatePod,
  togglePodActive,
  deletePod,
  addPodMember,
  removePodMember,
  type PodFormState,
  type PodMemberFormState,
} from "./actions";
import type { AdminPod, AdminMemberRow } from "@/lib/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { HoldButton } from "@/components/kokonutui/HoldButton";
import { cn } from "@/lib/cn";

export function PodCard({
  pod,
  activeMembers,
}: {
  pod: AdminPod;
  activeMembers: AdminMemberRow[];
}) {
  const [editing, setEditing] = useState(false);
  const updateWithId = updatePod.bind(null, pod.id);
  const [state, action, pending] = useActionState<PodFormState, FormData>(
    updateWithId,
    undefined
  );

  const addWithId = addPodMember.bind(null, pod.id);
  const [addState, addAction, addPending] = useActionState<PodMemberFormState, FormData>(
    addWithId,
    undefined
  );

  const deleteFormRef = useRef<HTMLFormElement>(null);
  const memberIds = new Set(pod.members.map((m) => m.userId));
  const addable = activeMembers.filter((m) => !memberIds.has(m.userId));

  return (
    <Card className="space-y-4">
      {editing ? (
        <form action={action} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">Pod name</label>
            <Input name="name" defaultValue={pod.name} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">
              Description
            </label>
            <Textarea name="description" rows={2} defaultValue={pod.description ?? ""} />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-stone hover:text-paper"
            >
              Close
            </button>
          </div>
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
        </form>
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-paper">{pod.name}</p>
            <p className="text-xs text-stone">
              {pod.members.length} member{pod.members.length === 1 ? "" : "s"}
              {pod.description && ` · ${pod.description}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn(pod.isActive && "border-gold/40 text-gold")}>
              {pod.isActive ? "Active" : "Inactive"}
            </Badge>
            <form action={togglePodActive.bind(null, pod.id, !pod.isActive)}>
              <button type="submit" className="text-xs text-stone hover:text-gold">
                {pod.isActive ? "Deactivate" : "Activate"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-stone transition-colors hover:text-gold"
            >
              Edit
            </button>
            <form ref={deleteFormRef} action={deletePod.bind(null, pod.id)}>
              <HoldButton
                idleLabel="Delete"
                holdingLabel="Keep holding…"
                onConfirm={() => deleteFormRef.current?.requestSubmit()}
              />
            </form>
          </div>
        </div>
      )}

      <div className="space-y-2 border-t border-line pt-3">
        {pod.members.length === 0 ? (
          <p className="text-sm text-stone">No members assigned yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {pod.members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between gap-3 py-2"
              >
                <p className="text-sm text-paper">{member.displayName ?? "Member"}</p>
                <form action={removePodMember.bind(null, pod.id, member.userId)}>
                  <button
                    type="submit"
                    className="text-xs text-stone transition-colors hover:text-danger"
                  >
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        {addable.length > 0 && (
          <form action={addAction} className="flex flex-wrap items-end gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-stone">
                Add member
              </label>
              <select
                name="user_id"
                defaultValue=""
                className="rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-paper outline-none focus-visible:border-gold"
              >
                <option value="">Select a member…</option>
                {addable.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.displayName ?? m.userId}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="secondary" disabled={addPending}>
              {addPending ? "Adding..." : "Add"}
            </Button>
            {addState?.error && (
              <p className="w-full text-sm text-danger">{addState.error}</p>
            )}
          </form>
        )}
      </div>
    </Card>
  );
}
