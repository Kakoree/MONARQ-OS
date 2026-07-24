"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  upgradeAccountWithPassword,
  upgradeAccountWithGoogle,
  type UpgradeAccountState,
} from "@/app/(app)/profile/actions";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function SecureAccountCard() {
  const [state, action, pending] = useActionState<UpgradeAccountState, FormData>(
    upgradeAccountWithPassword,
    undefined
  );

  return (
    <Card className="space-y-4 border-gold/30">
      <div>
        <p className="text-xs uppercase tracking-wider text-gold">Secure your account</p>
        <p className="mt-1 text-sm text-stone">
          Your account isn&apos;t tied to an email yet — if this session ever
          logs out, there&apos;s no way back in. Add a real email and password
          (or link Google) to keep everything you&apos;ve already built here.
        </p>
      </div>
      <form action={action} className="space-y-3">
        <Input name="email" type="email" placeholder="Email" required autoComplete="email" />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Secure with email"}
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
      <form action={upgradeAccountWithGoogle}>
        <Button type="submit" variant="secondary" className="w-full">
          Link Google instead
        </Button>
      </form>
    </Card>
  );
}
