"use client";

import { useActionState } from "react";
import { applyToBeMentorAction, type MentorFormState } from "../actions";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function ApplyForm() {
  const [state, action, pending] = useActionState<MentorFormState, FormData>(
    applyToBeMentorAction,
    undefined
  );

  if (state?.success) {
    return (
      <p className="text-sm text-gold">
        Application submitted. We&apos;ll review it shortly.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider text-stone">
          Headline
        </label>
        <Input name="headline" placeholder="10 years building discipline systems" required />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider text-stone">
          Bio
        </label>
        <Textarea name="bio" rows={4} required />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider text-stone">
          Focus areas (comma separated)
        </label>
        <Input name="focus_areas" placeholder="Strength training, Finance, Focus" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Submit application"}
      </Button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
