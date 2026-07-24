"use client";

import { useActionState } from "react";
import {
  requestMentorshipAction,
  type RequestMentorshipState,
} from "@/app/(app)/mentors/actions";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function RequestMentorshipForm({ mentorId }: { mentorId: string }) {
  const boundAction = requestMentorshipAction.bind(null, mentorId);
  const [state, action, pending] = useActionState<RequestMentorshipState, FormData>(
    boundAction,
    undefined
  );

  if (state?.success) {
    return (
      <p className="text-sm text-gold">
        Request sent. They&apos;ll follow up if they&apos;re a fit.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <Textarea
        name="message"
        placeholder="What are you looking for mentorship on?"
        rows={3}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Request mentorship"}
      </Button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
