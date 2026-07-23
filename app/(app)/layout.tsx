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
  if (status === "pending" || status === null) redirect("/onboarding");

  return (
    <AppShell userEmail={user.email ?? null} isAdmin={role === "admin"}>
      {children}
    </AppShell>
  );
}
