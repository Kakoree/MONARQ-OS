"use client";

import { useActionState, useState } from "react";
import { reportAction, type ReportFormState } from "@/app/(app)/members/[id]/actions";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function ReportMemberForm({ reportedUserId }: { reportedUserId: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = reportAction.bind(null, reportedUserId);
  const [state, action, pending] = useActionState<ReportFormState, FormData>(
    boundAction,
    undefined
  );

  if (state?.success) {
    return <p className="text-xs text-stone">Report submitted. Admin will review it.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-stone transition-colors hover:text-danger"
      >
        Report
      </button>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <Textarea
        name="reason"
        placeholder="What happened?"
        rows={2}
        required
        className="text-sm"
      />
      <div className="flex items-center gap-2">
        <Button type="submit" variant="secondary" disabled={pending} className="px-3 py-1.5 text-xs">
          {pending ? "Submitting..." : "Submit report"}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-stone hover:text-paper"
        >
          Cancel
        </button>
      </div>
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
    </form>
  );
}
