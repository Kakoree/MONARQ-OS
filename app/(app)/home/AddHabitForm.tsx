"use client";

import { useActionState } from "react";
import { addHabit, type AddHabitState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function AddHabitForm() {
  const [state, action, pending] = useActionState<AddHabitState, FormData>(
    addHabit,
    undefined
  );

  return (
    <div className="space-y-2">
      <form action={action} className="flex gap-2">
        <Input
          type="text"
          name="name"
          placeholder="Add a habit — e.g. Train, Read, Journal"
          autoComplete="off"
          required
          className="flex-1"
        />
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Adding..." : "Add"}
        </Button>
      </form>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </div>
  );
}
