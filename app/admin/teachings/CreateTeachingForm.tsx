"use client";

import { useActionState } from "react";
import { createTeaching, type TeachingFormState } from "./actions";
import type { AdminTeachingCategory } from "@/lib/admin";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const ROLE_OPTIONS = ["guest", "member", "moderator", "admin"] as const;

export function CreateTeachingForm({
  categories,
}: {
  categories: AdminTeachingCategory[];
}) {
  const [state, action, pending] = useActionState<TeachingFormState, FormData>(
    createTeaching,
    undefined
  );

  return (
    <Card>
      <form action={action} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">Title</label>
            <Input name="title" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">Track</label>
            <select
              name="category_id"
              defaultValue=""
              className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-paper outline-none focus-visible:border-gold"
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">Summary</label>
          <Textarea name="summary" rows={2} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">Body</label>
          <Textarea name="body" rows={6} required />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">Required role</label>
            <select
              name="required_role"
              defaultValue="member"
              className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-paper outline-none focus-visible:border-gold"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">Sort order</label>
            <Input name="sort_order" type="number" defaultValue={0} />
          </div>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create teaching"}
        </Button>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      </form>
    </Card>
  );
}
