import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed Middleware to Proxy (this file replaces middleware.ts).
// Scope for Phase 2 is session-cookie refresh only — membership-state-aware
// route protection is added in Phase 3.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // /api excluded: API routes (e.g. app/api/cron/*) authenticate
    // themselves and have no user session cookie to refresh — without this
    // exclusion, unauthenticated requests like a Vercel Cron invocation get
    // redirected to /login before the route handler ever runs.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
