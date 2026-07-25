"use client";

import { useActionState, useRef, useState } from "react";
import { updateTier, deleteTier, type TierFormState } from "./actions";
import type { Tier } from "@/lib/seasons";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { HoldButton } from "@/components/kokonutui/HoldButton";

export function TierRow({ tier }: { tier: Tier }) {
  const [editing, setEditing] = useState(false);
  const updateWithId = updateTier.bind(null, tier.id);
  const [state, action, pending] = useActionState<TierFormState, FormData>(
    updateWithId,
    undefined
  );
  const deleteFormRef = useRef<HTMLFormElement>(null);

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-sm text-paper">{tier.name}</p>
          <p className="text-xs text-stone">
            {tier.minPoints}+ points · sort {tier.sortOrder}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-stone transition-colors hover:text-gold"
          >
            Edit
          </button>
          <form ref={deleteFormRef} action={deleteTier.bind(null, tier.id)}>
            <HoldButton
              idleLabel="Delete"
              holdingLabel="Keep holding…"
              onConfirm={() => deleteFormRef.current?.requestSubmit()}
            />
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <form action={action} className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">Name</label>
          <Input name="name" defaultValue={tier.name} className="w-32" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">Min. points</label>
          <Input
            name="min_points"
            type="number"
            min={0}
            defaultValue={tier.minPoints}
            className="w-28"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">Sort order</label>
          <Input name="sort_order" type="number" defaultValue={tier.sortOrder} className="w-24" />
        </div>
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
        {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
      </form>
    </div>
  );
}
