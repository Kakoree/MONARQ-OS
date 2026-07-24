"use client";

import { useActionState } from "react";
import { createDrop, type DropFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Tier } from "@/lib/seasons";

export function CreateDropForm({ tiers }: { tiers: Tier[] }) {
  const [state, action, pending] = useActionState<DropFormState, FormData>(
    createDrop,
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
            <Input name="title" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">
              Price (USD, blank if free/N/A)
            </label>
            <Input name="price_cents" type="number" step="0.01" min={0} />
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
              Image URL
            </label>
            <Input name="image_url" type="url" placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">
              External purchase URL
            </label>
            <Input name="external_url" type="url" placeholder="https://..." />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">
              Available from
            </label>
            <Input name="available_from" type="datetime-local" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">
              Available until
            </label>
            <Input name="available_until" type="datetime-local" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">
              Required tier for early access
            </label>
            <select
              name="required_tier_id"
              className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-paper outline-none focus-visible:border-gold"
            >
              <option value="">None — open to all at available_from</option>
              {tiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name}+
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">
              Early access hours
            </label>
            <Input name="early_access_hours" type="number" min={0} defaultValue={0} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-paper/80">
          <input name="is_key_drop" type="checkbox" className="accent-gold" />
          Key drop (ownership claimed via a linked access code)
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create drop"}
        </Button>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      </form>
    </Card>
  );
}
