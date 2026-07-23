import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/lib/auth-actions";
import { NavList } from "./NavList";
import { PageTitle } from "./PageTitle";

export function Topbar({
  userEmail,
  isAdmin,
}: {
  userEmail: string | null;
  isAdmin: boolean;
}) {
  return (
    <header className="border-b border-line">
      <div className="flex h-16 items-center justify-between px-6 md:px-10">
        <span className="font-display text-lg tracking-[0.15em] text-paper md:hidden">
          MONARQ
        </span>
        <span className="hidden md:inline">
          <PageTitle />
        </span>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link
              href="/admin/members"
              className="text-xs text-gold transition-colors hover:opacity-80"
            >
              Admin
            </Link>
          )}
          {userEmail && (
            <span className="hidden text-xs text-stone sm:inline">
              {userEmail}
            </span>
          )}
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              className="px-3 py-1.5 text-xs"
            >
              Sign out
            </Button>
          </form>
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <NavList orientation="horizontal" />
      </div>
    </header>
  );
}
