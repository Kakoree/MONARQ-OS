"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

function LinkExpiredNotice() {
  const searchParams = useSearchParams();

  if (searchParams.get("error") !== "link_expired") {
    return null;
  }

  return (
    <p className="mb-4 text-sm text-danger">
      That sign-in link has expired or already been used. Enter your email
      below for a new one.
    </p>
  );
}

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the sign-in link.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="font-display text-2xl tracking-[0.2em] text-paper">
            MONARQ
          </span>
          <p className="mt-2 text-sm text-stone">
            Enter your email to receive a sign-in link.
          </p>
        </div>
        <Suspense fallback={null}>
          <LinkExpiredNotice />
        </Suspense>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full">
            Send sign-in link
          </Button>
          {message && <p className="text-sm text-stone">{message}</p>}
        </form>
      </Card>
    </main>
  );
}
