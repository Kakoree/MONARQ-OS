"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  signUpMember,
  signInMember,
  signInWithGoogle,
  type SignUpState,
  type SignInState,
} from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Tab = "join" | "signin";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("join");
  const [code, setCode] = useState("");
  const [signUpState, signUpAction, signUpPending] = useActionState<
    SignUpState,
    FormData
  >(signUpMember, undefined);
  const [signInState, signInAction, signInPending] = useActionState<
    SignInState,
    FormData
  >(signInMember, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="font-display text-2xl tracking-[0.2em] text-paper">
            MONARQ
          </span>
          <p className="mt-2 text-sm text-stone">MONARQ is invite-only.</p>
        </div>

        <div className="mb-6 flex rounded-md border border-line p-1">
          <button
            type="button"
            onClick={() => setTab("join")}
            className={cn(
              "flex-1 rounded-sm py-1.5 text-sm transition-colors",
              tab === "join" ? "bg-surface-raised text-paper" : "text-stone hover:text-paper"
            )}
          >
            Join
          </button>
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={cn(
              "flex-1 rounded-sm py-1.5 text-sm transition-colors",
              tab === "signin" ? "bg-surface-raised text-paper" : "text-stone hover:text-paper"
            )}
          >
            Sign in
          </button>
        </div>

        <AnimatePresence mode="wait">
          {tab === "join" ? (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {signUpState?.status === "check-email" ? (
                <p className="text-sm text-paper">
                  Check your inbox — we sent a confirmation link to finish
                  creating your account.
                </p>
              ) : (
                <form action={signUpAction} className="space-y-4">
                  <Input
                    name="code"
                    placeholder="Access code"
                    required
                    autoComplete="off"
                    className="uppercase tracking-wide"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                  />
                  <Input name="email" type="email" placeholder="Email" required autoComplete="email" />
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <Button type="submit" className="w-full" disabled={signUpPending}>
                    {signUpPending ? "Creating..." : "Create account"}
                  </Button>
                  <AnimatePresence>
                    {signUpState?.status === "error" && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm text-danger"
                      >
                        {signUpState.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>
              )}

              <Divider />

              <form action={signInWithGoogle}>
                <input type="hidden" name="code" value={code} />
                <Button type="submit" variant="secondary" className="w-full">
                  Continue with Google
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="signin"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <form action={signInAction} className="space-y-4">
                <Input name="email" type="email" placeholder="Email" required autoComplete="email" />
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                />
                <Button type="submit" className="w-full" disabled={signInPending}>
                  {signInPending ? "Signing in..." : "Sign in"}
                </Button>
                <AnimatePresence>
                  {signInState?.error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm text-danger"
                    >
                      {signInState.error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </form>

              <Divider />

              <form action={signInWithGoogle}>
                <Button type="submit" variant="secondary" className="w-full">
                  Continue with Google
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 border-t border-line pt-4 text-center">
          <Link href="/login/admin" className="text-xs text-stone hover:text-paper">
            Admin login
          </Link>
        </div>
      </Card>
    </main>
  );
}

function Divider() {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-line" />
      <span className="text-xs text-stone">or</span>
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}
