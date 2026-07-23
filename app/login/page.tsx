"use client";

import { Suspense, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { sendSignInLink, type SignInState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

function ExpiredLinkNotice() {
  const searchParams = useSearchParams();

  if (searchParams.get("error") !== "link_expired") {
    return null;
  }

  return (
    <p className="mb-4 text-sm text-danger">
      That link has expired or already been used. Enter your access code
      again to continue.
    </p>
  );
}

const initialState: SignInState = { status: "idle" };

// Two-step entry: access code first (client-side only — see note below),
// then email to actually authenticate. The code is carried through the
// magic-link redirect and auto-redeemed in app/auth/callback/route.ts.
//
// NOT YET IMPLEMENTED: step one does not check the code against the
// database — it only requires a non-empty value before moving on. Real
// validation still happens exactly where it always has, at redemption time
// via the redeem_access_code() RPC, after the member authenticates. A
// junk code here just means redemption silently fails and the member falls
// through to the existing manual retry at /onboarding. A real pre-auth
// existence check would need a new function callable by anonymous
// visitors, which is new attack surface (code enumeration) worth designing
// deliberately rather than adding in passing here.
export default function LoginPage() {
  const [step, setStep] = useState<"code" | "email">("code");
  const [accessCode, setAccessCode] = useState("");
  const [state, action, pending] = useActionState(
    sendSignInLink,
    initialState
  );

  const handleCodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessCode.trim()) return;
    setStep("email");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="font-display text-2xl tracking-[0.2em] text-paper">
            MONARQ
          </span>
          <p className="mt-2 text-sm text-stone">MONARQ is invite-only.</p>
        </div>

        <Suspense fallback={null}>
          <ExpiredLinkNotice />
        </Suspense>

        {step === "code" ? (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Access code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="uppercase tracking-wide"
              autoComplete="off"
              required
            />
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        ) : (
          <form action={action} className="space-y-4">
            <input type="hidden" name="code" value={accessCode} />
            <p className="text-sm text-stone">
              Enter your email — we&apos;ll send you a secure link to
              confirm it&apos;s you.
            </p>
            <Input
              type="email"
              name="email"
              placeholder="you@example.com"
              required
            />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Sending..." : "Continue"}
            </Button>
            <button
              type="button"
              onClick={() => setStep("code")}
              className="text-xs text-stone hover:text-paper"
            >
              ← Back
            </button>
            {state.status === "sent" && (
              <p className="text-sm text-stone">
                Check your email for a secure link to finish signing in.
              </p>
            )}
            {state.status === "error" && (
              <p className="text-sm text-danger">{state.message}</p>
            )}
          </form>
        )}

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
