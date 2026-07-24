"use client";

import { useActionState } from "react";
import { createIdentityMarker, type IdentityMarkerFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function CreateIdentityMarkerForm() {
  const [state, action, pending] = useActionState<IdentityMarkerFormState, FormData>(
    createIdentityMarker,
    undefined
  );

  return (
    <Card>
      <form action={action} className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">
            Name
          </label>
          <Input name="name" placeholder="Athlete" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">
            Description
          </label>
          <Input
            name="description"
            placeholder="Discipline through the body..."
            className="w-72"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">
            Sort order
          </label>
          <Input name="sort_order" type="number" defaultValue={0} className="w-24" />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create marker"}
        </Button>
        {state?.error && (
          <p className="w-full text-sm text-danger">{state.error}</p>
        )}
      </form>
    </Card>
  );
}
