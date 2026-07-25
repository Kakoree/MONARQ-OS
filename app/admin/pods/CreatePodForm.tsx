"use client";

import { useActionState } from "react";
import { createPod, type PodFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function CreatePodForm() {
  const [state, action, pending] = useActionState<PodFormState, FormData>(
    createPod,
    undefined
  );

  return (
    <Card>
      <form action={action} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">Pod name</label>
          <Input name="name" placeholder="Dawn Pod" required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-wider text-stone">
            Description (optional)
          </label>
          <Textarea name="description" rows={2} />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating..." : "Create pod"}
        </Button>
        {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      </form>
    </Card>
  );
}
