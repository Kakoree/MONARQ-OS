"use client";

import { useActionState, useState } from "react";
import { updateTeachingCategory, type TeachingCategoryFormState } from "./actions";
import type { AdminTeachingCategory } from "@/lib/admin";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function TeachingCategoryRow({
  category,
  mentors,
}: {
  category: AdminTeachingCategory;
  mentors: { id: string; displayName: string }[];
}) {
  const [editing, setEditing] = useState(false);
  const updateWithId = updateTeachingCategory.bind(null, category.id);
  const [state, action, pending] = useActionState<TeachingCategoryFormState, FormData>(
    updateWithId,
    undefined
  );

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-sm text-paper">{category.name}</p>
          <p className="text-xs text-stone">
            sort {category.sortOrder}
            {category.mentorName && ` · led by ${category.mentorName}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-stone transition-colors hover:text-gold"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <form action={action} className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">Track name</label>
          <Input name="name" defaultValue={category.name} className="w-40" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">Sort order</label>
          <Input
            name="sort_order"
            type="number"
            defaultValue={category.sortOrder}
            className="w-24"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">Mentor-led</label>
          <select
            name="mentor_id"
            defaultValue={category.mentorId ?? ""}
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
