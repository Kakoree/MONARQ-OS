import { requireAdmin } from "@/lib/admin";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // notFound()s for anyone who isn't an active admin — deliberately not a
  // redirect, so this area doesn't confirm its own existence to members
  // probing the URL. proxy.ts still catches fully signed-out visitors first.
  await requireAdmin();

  return <AdminShell>{children}</AdminShell>;
}
