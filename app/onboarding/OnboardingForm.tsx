"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { redeemAccessCode, type RedeemState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function OnboardingForm({ defaultCode }: { defaultCode?: string }) {
  const [state, action, pending] = useActionState<RedeemState, FormData>(
    redeemAccessCode,
    undefined
  );

  return (
    <form action={action} className="space-y-4">
      <Input
        type="text"
        name="code"
        placeholder="Access code"
        className="uppercase tracking-wide"
        defaultValue={defaultCode}
        required
        autoComplete="off"
        onChange={(e) => {
          e.currentTarget.value = e.currentTarget.value.toUpperCase();
        }}
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Checking..." : "Redeem code"}
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
  );
}
