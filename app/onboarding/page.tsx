import { redirect } from "next/navigation";
import { getCurrentMembership } from "@/lib/membership";
import { OnboardingForm } from "./OnboardingForm";
import { Card } from "@/components/ui/Card";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { user, status, role, debugError } = await getCurrentMembership();
  const { code } = await searchParams;

  if (!user) redirect("/login");
  if (status === "active") redirect("/");
  if (status === "suspended" || status === "revoked") redirect("/pending");

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <Card className="w-full max-w-md">
        <span className="font-display text-2xl tracking-[0.2em] text-paper">
          MONARQ
        </span>
        <h1 className="mt-4 text-lg font-medium text-paper">
          Enter your access code
        </h1>
        <p className="mt-1 text-sm text-stone">
          MONARQ is invite-only. Enter the code you were given to activate
          your membership.
        </p>
        <div className="mt-6">
          <OnboardingForm defaultCode={code} />
        </div>
        {/* TEMPORARY V1 diagnostic — remove once the admin-redirect
            investigation is closed. */}
        <div className="mt-6 rounded border border-line p-3 text-xs text-stone">
          <p>debug user.id: {user.id}</p>
          <p>debug status: {String(status)}</p>
          <p>debug role: {String(role)}</p>
          <p>debug error: {debugError ?? "none"}</p>
        </div>
      </Card>
    </main>
  );
}
