"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Standalone (no AppShell), same reasoning as app/not-found.tsx. Uses the
// stable `reset` prop rather than the new (v16.2.0) `unstable_retry` — that
// API is explicitly unstable-prefixed, so not worth depending on yet.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 text-center">
      <Card className="w-full max-w-md">
        <span className="font-display text-2xl tracking-[0.2em] text-paper">
          MONARQ
        </span>
        <h1 className="mt-4 text-lg font-medium text-paper">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-stone">
          That didn&apos;t load correctly. Try again, or head back to Home.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Link href="/home" className="text-sm text-stone hover:text-paper">
            Back to Home
          </Link>
        </div>
      </Card>
    </main>
  );
}
