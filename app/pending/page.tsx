import { redirect } from "next/navigation";
import { getCurrentMembership } from "@/lib/membership";
import { Card } from "@/components/ui/Card";

export default async function PendingPage() {
  const { user, status } = await getCurrentMembership();

  if (!user) redirect("/login");
  if (status === "active") redirect("/");
  if (status === "pending" || status === null) redirect("/onboarding");

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6 text-center">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-2xl text-paper">
          Access {status}
        </h1>
        <p className="mt-2 text-sm text-stone">
          Your MONARQ membership has been {status}. Contact support if you
          believe this is a mistake.
        </p>
      </Card>
    </main>
  );
}
