import { redirect } from "next/navigation";
import { getCurrentMembership } from "@/lib/membership";
import { AppShell } from "@/components/shell/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, status, role } = await getCurrentMembership();

  if (!user) redirect("/login");
  if (status === "suspended" || status === "revoked") redirect("/pending");
  // Admins are provisioned directly in the database, not via access-code
  // redemption — they must never be routed through the member onboarding
  // gate just for lacking a redeemed code.
  if (role !== "admin" && (status === "pending" || status === null)) {
    redirect("/onboarding");
  }

  return (
    <AppShell userEmail={user.email ?? null} isAdmin={role === "admin"}>
      {children}
    </AppShell>
  );
}
