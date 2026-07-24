"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { completeOnboarding, type FirstHabitState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function FirstHabitStep() {
  const [state, action, pending] = useActionState<FirstHabitState, FormData>(
    completeOnboarding,
    undefined
  );

  return (
    <form action={action} className="space-y-4">
      <Input
        type="text"
        name="habit"
        placeholder="e.g. Train, Read, No phone before noon"
        required
        maxLength={80}
        autoComplete="off"
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Locking it in..." : "Set my first habit"}
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
