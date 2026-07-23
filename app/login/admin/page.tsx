"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  signInAdmin,
  requestAdminPasswordReset,
  type AdminSignInState,
  type PasswordResetState,
} from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

const initialSignInState: AdminSignInState = undefined;
const initialResetState: PasswordResetState = { status: "idle" };

// Password-based entry — no magic link. Also the only way back in for any
// returning member without an access code (see app/login/page.tsx's
// comment for why there's no way to tell those apart before auth happens).
export default function AdminLoginPage() {
  const [mode, setMode] = useState<"signin" | "reset">("signin");
  const [signInState, signInAction, signInPending] = useActionState(
    signInAdmin,
    initialSignInState
  );
  const [resetState, resetAction, resetPending] = useActionState(
    requestAdminPasswordReset,
    initialResetState
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <Card className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="font-display text-lg tracking-[0.15em] text-stone">
            MONARQ ADMIN
          </span>
          <p className="mt-2 text-sm text-stone">
            {mode === "signin"
              ? "Sign in with your email and password."
              : "We'll email you a link to set a new password."}
          </p>
        </div>

        {mode === "signin" ? (
          <form action={signInAction} className="space-y-4">
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <Button type="submit" className="w-full" disabled={signInPending}>
              {signInPending ? "Signing in..." : "Sign in"}
            </Button>
            {signInState?.error && (
              <p className="text-sm text-danger">{signInState.error}</p>
            )}
            <button
              type="button"
              onClick={() => setMode("reset")}
              className="text-xs text-stone hover:text-paper"
            >
              Need to set a password?
            </button>
          </form>
        ) : (
          <form action={resetAction} className="space-y-4">
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
            />
            <Button type="submit" className="w-full" disabled={resetPending}>
              {resetPending ? "Sending..." : "Email me a reset link"}
            </Button>
            {resetState.status === "sent" && (
              <p className="text-sm text-stone">
                Check your email for the link.
              </p>
            )}
            {resetState.status === "error" && (
              <p className="text-sm text-danger">{resetState.message}</p>
            )}
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="text-xs text-stone hover:text-paper"
            >
              ← Back to sign in
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-xs text-stone hover:text-paper">
            ← Back to member entry
          </Link>
        </div>
      </Card>
    </main>
  );
}
