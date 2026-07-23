"use client";

import { useActionState } from "react";
import { redeemAccessCode, type RedeemState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function OnboardingForm() {
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
        required
        autoComplete="off"
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Checking..." : "Redeem code"}
      </Button>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
