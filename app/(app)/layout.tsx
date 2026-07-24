import { redirect } from "next/navigation";
import { getCurrentMembership } from "@/lib/membership";
import { getNotifications, getUnreadNotificationCount } from "@/lib/notifications";
import { AppShell } from "@/components/shell/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, status, role, onboardingCompletedAt } = await getCurrentMembership();

  if (!user) redirect("/login");
  if (status === "suspended" || status === "revoked") redirect("/pending");
  // Admins are provisioned directly in the database, not via access-code
  // redemption — they must never be routed through the member onboarding
  // gate just for lacking a redeemed code or an unset identity marker.
  if (role !== "admin") {
    if (status === "pending" || status === null) {
      redirect("/onboarding");
    }
    if (status === "active" && !onboardingCompletedAt) {
      redirect("/onboarding");
    }
  }

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(10),
    getUnreadNotificationCount(),
  ]);

  return (
    <AppShell
      userEmail={user.email ?? null}
      isAdmin={role === "admin"}
      notifications={notifications}
      unreadCount={unreadCount}
    >
      {children}
    </AppShell>
  );
}
