"use client";

import { useActionState } from "react";
import { createTeachingCategory, type TeachingCategoryFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function CreateTeachingCategoryForm({
  mentors,
}: {
  mentors: { id: string; displayName: string }[];
}) {
  const [state, action, pending] = useActionState<TeachingCategoryFormState, FormData>(
    createTeachingCategory,
    undefined
  );

  return (
    <Card>
      <form action={action} className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">Track name</label>
          <Input name="name" placeholder="Discipline" className="w-40" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">Sort order</label>
          <Input name="sort_order" type="number" defaultValue={0} className="w-24" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">
            Mentor-led (optional)
          </label>
          <select
            name="mentor_id"
            defaultValue=""
            className="rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-paper outline-none focus-visible:border-gold"
          >
            <option value="">None</option>
            {mentors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create track"}
        </Button>
        {state?.error && <p className="w-full text-sm text-danger">{state.error}</p>}
      </form>
    </Card>
  );
}
