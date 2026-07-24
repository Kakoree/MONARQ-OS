"use client";

import { useActionState } from "react";
import { createSeason, type SeasonFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function CreateSeasonForm() {
  const [state, action, pending] = useActionState<SeasonFormState, FormData>(
    createSeason,
    undefined
  );

  return (
    <Card>
      <form action={action} className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">Name</label>
          <Input name="name" placeholder="Season I" className="w-36" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">Starts</label>
          <Input name="starts_at" type="date" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">Ends</label>
          <Input name="ends_at" type="date" required />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create season"}
        </Button>
        {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
      </form>
    </Card>
  );
}
