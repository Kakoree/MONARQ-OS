"use client";

import { useActionState } from "react";
import Link from "next/link";
import { sendSignInLink, type SignInState } from "../actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

const initialState: SignInState = { status: "idle" };

// Deliberately at /login/admin, not /admin/login — app/admin/layout.tsx
// gates on an active admin role, which would make a page nested under it
// unreachable by anyone not already authenticated as an admin.
//
// This is also the only way back in for any returning member (not just
// admins) who no longer has their original access code — there's no way to
// tell a returning member from an admin before authentication happens, so
// this page is intentionally not admin-exclusive. Whether someone lands in
// the regular app or the admin panel depends entirely on their role/status
// after signing in, exactly as it already does elsewhere.
export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(
    sendSignInLink,
    initialState
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <Card className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="font-display text-lg tracking-[0.15em] text-stone">
            MONARQ ADMIN
          </span>
          <p className="mt-2 text-sm text-stone">
            Already a member? Sign in with your email — no access code
            needed.
          </p>
        </div>
        <form action={action} className="space-y-4">
          <Input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending..." : "Continue"}
          </Button>
          {state.status === "sent" && (
            <p className="text-sm text-stone">
              Check your email for a secure link.
            </p>
          )}
          {state.status === "error" && (
            <p className="text-sm text-danger">{state.message}</p>
          )}
        </form>
        <div className="mt-6 text-center">
          <Link href="/login" className="text-xs text-stone hover:text-paper">
            ← Back to member entry
          </Link>
        </div>
      </Card>
    </main>
  );
}
