import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes reachable without an active session. Membership-state-aware
// protection (pending/suspended/revoked) happens in app/(app)/layout.tsx,
// which can afford a real DB read — this check stays session-presence-only
// per Next.js's guidance to keep Proxy checks optimistic and cheap.
const PUBLIC_PATHS = ["/login", "/auth/callback", "/onboarding", "/pending"];

// Refreshes the Supabase auth cookie on every request and redirects signed-out
// visitors away from anything that isn't a public route. Called from the
// project-root proxy.ts (Next.js 16's replacement for middleware.ts).
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not add logic between createServerClient and getUser() — the Supabase
  // SSR docs warn this can cause hard-to-debug random logouts.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (!user && !isPublicPath) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
