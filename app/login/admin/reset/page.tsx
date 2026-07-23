"use client";

import { useActionState } from "react";
import { setAdminPassword, type SetPasswordState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

const initialState: SetPasswordState = { status: "idle" };

export default function AdminResetPasswordPage() {
  const [state, action, pending] = useActionState(
    setAdminPassword,
    initialState
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <Card className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="font-display text-lg tracking-[0.15em] text-stone">
            MONARQ ADMIN
          </span>
          <p className="mt-2 text-sm text-stone">Set a new password.</p>
        </div>
        <form action={action} className="space-y-4">
          <Input
            type="password"
            name="password"
            placeholder="New password"
            required
            minLength={8}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving..." : "Set password"}
          </Button>
          {state.status === "error" && (
            <p className="text-sm text-danger">{state.message}</p>
          )}
        </form>
      </Card>
    </main>
  );
}
