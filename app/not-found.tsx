import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { buttonClassName } from "@/components/ui/Button";

// Standalone (no AppShell) — this can be hit before authentication or from
// the admin gate's notFound(), so it can't assume any particular layout is
// wrapping it. Matches the login/onboarding/pending centered-card pattern.
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 text-center">
      <Card className="w-full max-w-md">
        <span className="font-display text-2xl tracking-[0.2em] text-paper">
          MONARQ
        </span>
        <h1 className="mt-4 text-lg font-medium text-paper">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-stone">
          This page doesn&apos;t exist, or you don&apos;t have access to it.
        </p>
        <Link
          href="/home"
          className={buttonClassName("primary", "mt-6 inline-flex")}
        >
          Back to Home
        </Link>
      </Card>
    </main>
  );
}
