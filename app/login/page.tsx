"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  enterWithAccessCode,
  type AccessCodeEntryState,
} from "./temporary-v1-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

const initialState: AccessCodeEntryState = undefined;

// TEMPORARY V1 TESTING ENTRY — access-code-only, no email/identity
// verification. See temporary-v1-actions.ts for the full explanation of
// why, and what this needs to become before real launch.
export default function LoginPage() {
  const [state, action, pending] = useActionState(
    enterWithAccessCode,
    initialState
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="font-display text-2xl tracking-[0.2em] text-paper">
            MONARQ
          </span>
          <p className="mt-2 text-sm text-stone">MONARQ is invite-only.</p>
        </div>
        <form action={action} className="space-y-4">
          <Input
            type="text"
            name="code"
            placeholder="Access code"
            className="uppercase tracking-wide"
            autoComplete="off"
            required
            onChange={(e) => {
              e.currentTarget.value = e.currentTarget.value.toUpperCase();
            }}
          />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Checking..." : "Continue"}
          </Button>
          <AnimatePresence>
            {state?.error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-danger"
              >
                {state.error}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
        <div className="mt-6 border-t border-line pt-4 text-center">
          <Link
            href="/login/admin"
            className="text-xs text-stone hover:text-paper"
          >
            Admin login
          </Link>
        </div>
      </Card>
    </main>
  );
}
