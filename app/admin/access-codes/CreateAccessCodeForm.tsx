"use client";

import { useActionState } from "react";
import { createAccessCode, type AccessCodeFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { DropOption } from "@/lib/admin";

export function CreateAccessCodeForm({ dropOptions }: { dropOptions: DropOption[] }) {
  const [state, action, pending] = useActionState<AccessCodeFormState, FormData>(
    createAccessCode,
    undefined
  );

  return (
    <Card>
      <form action={action} className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">
            Code
          </label>
          <Input name="code" placeholder="WELCOME1" className="uppercase" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">
            For (recipient)
          </label>
          <Input name="label" placeholder="Jordan K." className="w-40" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">
            Max uses
          </label>
          <Input
            name="max_uses"
            type="number"
            min={1}
            defaultValue={1}
            className="w-24"
          />
        </div>
        {dropOptions.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">
              Link to key drop
            </label>
            <select
              name="drop_id"
              className="h-[42px] rounded-md border border-line bg-surface px-3.5 text-sm text-paper outline-none focus-visible:border-gold"
            >
              <option value="">None</option>
              {dropOptions.map((drop) => (
                <option key={drop.id} value={drop.id}>
                  {drop.title}
                </option>
              ))}
            </select>
          </div>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create code"}
        </Button>
        {state?.error && (
          <p className="w-full text-sm text-danger">{state.error}</p>
        )}
      </form>
    </Card>
  );
}
