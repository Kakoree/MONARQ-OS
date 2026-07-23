import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({
  userEmail,
  isAdmin,
  children,
}: {
  userEmail: string | null;
  isAdmin: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-ink text-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar userEmail={userEmail} isAdmin={isAdmin} />
        <main className="flex-1 px-6 py-8 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
