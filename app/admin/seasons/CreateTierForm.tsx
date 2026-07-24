"use client";

import { useActionState } from "react";
import { createTier, type TierFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function CreateTierForm() {
  const [state, action, pending] = useActionState<TierFormState, FormData>(
    createTier,
    undefined
  );

  return (
    <Card>
      <form action={action} className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">Name</label>
          <Input name="name" placeholder="Tier I" className="w-32" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">
            Min. points
          </label>
          <Input name="min_points" type="number" min={0} defaultValue={0} className="w-28" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">
            Sort order
          </label>
          <Input name="sort_order" type="number" defaultValue={0} className="w-24" />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create tier"}
        </Button>
        {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
      </form>
    </Card>
  );
}
