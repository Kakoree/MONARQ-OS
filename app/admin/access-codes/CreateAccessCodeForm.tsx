"use client";

import { useActionState } from "react";
import { createAccessCode, type AccessCodeFormState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function CreateAccessCodeForm() {
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
