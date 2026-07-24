"use client";

import { useActionState } from "react";
import { createChallenge, type ChallengeFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function CreateChallengeForm() {
  const [state, action, pending] = useActionState<ChallengeFormState, FormData>(
    createChallenge,
    undefined
  );

  return (
    <Card>
      <form action={action} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">
              Title
            </label>
            <Input name="title" placeholder="7-Day Cold Streak" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">
              XP reward
            </label>
            <Input name="xp_reward" type="number" min={1} defaultValue={50} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">
            Description
          </label>
          <Textarea name="description" rows={3} required />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">
              Starts
            </label>
            <Input name="starts_at" type="datetime-local" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">
              Ends
            </label>
            <Input name="ends_at" type="datetime-local" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-paper/80">
          <input name="is_group" type="checkbox" className="accent-gold" />
          Group challenge (adds a shared &ldquo;N of M members&rdquo; progress
          display alongside individual join/complete)
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create challenge"}
        </Button>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      </form>
    </Card>
  );
}
