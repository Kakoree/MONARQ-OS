"use client";

import { useActionState } from "react";
import { updateOwnMentorProfileAction, type MentorFormState } from "../actions";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function EditMentorProfileForm({
  headline,
  bio,
  focusAreas,
  isAcceptingRequests,
}: {
  headline: string;
  bio: string;
  focusAreas: string[];
  isAcceptingRequests: boolean;
}) {
  const [state, action, pending] = useActionState<MentorFormState, FormData>(
    updateOwnMentorProfileAction,
    undefined
  );

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider text-stone">
          Headline
        </label>
        <Input name="headline" defaultValue={headline} required />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider text-stone">
          Bio
        </label>
        <Textarea name="bio" defaultValue={bio} rows={4} required />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider text-stone">
          Focus areas (comma separated)
        </label>
        <Input name="focus_areas" defaultValue={focusAreas.join(", ")} />
      </div>
      <label className="flex items-center gap-2 text-sm text-paper/80">
        <input
          name="is_accepting_requests"
          type="checkbox"
          defaultChecked={isAcceptingRequests}
          className="accent-gold"
        />
        Accepting mentorship requests
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-gold">Saved.</p>}
    </form>
  );
}
