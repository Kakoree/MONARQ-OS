"use client";

import { useActionState, useState } from "react";
import { updateTeaching, toggleTeachingPublished, type TeachingFormState } from "./actions";
import type { AdminTeaching, AdminTeachingCategory } from "@/lib/admin";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const ROLE_OPTIONS = ["guest", "member", "moderator", "admin"] as const;

export function TeachingRow({
  teaching,
  categories,
}: {
  teaching: AdminTeaching;
  categories: AdminTeachingCategory[];
}) {
  const [editing, setEditing] = useState(false);
  const updateWithId = updateTeaching.bind(null, teaching.id);
  const [state, action, pending] = useActionState<TeachingFormState, FormData>(
    updateWithId,
    undefined
  );

  if (!editing) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-sm text-paper">{teaching.title}</p>
          <p className="text-xs text-stone">
            {teaching.requiredRole}+ · sort {teaching.sortOrder}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn(teaching.isPublished && "border-gold/40 text-gold")}>
            {teaching.isPublished ? "Published" : "Draft"}
          </Badge>
          <form action={toggleTeachingPublished.bind(null, teaching.id, !teaching.isPublished)}>
            <button type="submit" className="text-xs text-stone hover:text-gold">
              {teaching.isPublished ? "Unpublish" : "Publish"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-stone transition-colors hover:text-gold"
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <form action={action} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">Title</label>
            <Input name="title" defaultValue={teaching.title} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">Track</label>
            <select
              name="category_id"
              defaultValue={teaching.categoryId ?? ""}
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
          <Textarea name="summary" rows={2} defaultValue={teaching.summary} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">Body</label>
          <Textarea name="body" rows={6} defaultValue={teaching.body} required />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-stone">Required role</label>
            <select
              name="required_role"
              defaultValue={teaching.requiredRole}
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
            <Input name="sort_order" type="number" defaultValue={teaching.sortOrder} />
          </div>
        </div>
        <div className="flex items-center gap-3">
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
        </div>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      </form>
    </div>
  );
}
