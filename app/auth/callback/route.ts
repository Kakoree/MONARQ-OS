import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Shared callback for every email/OAuth round-trip: admin password-reset
// bootstrap (next=set-password), and member sign-up/Google sign-in
// (app/login/actions.ts), which also thread an access_code through so it
// survives the redirect and can be handed to /onboarding.
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const accessCode = requestUrl.searchParams.get("access_code");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=link_expired", request.url)
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/login?error=link_expired", request.url)
    );
  }

  if (next === "set-password") {
    return NextResponse.redirect(new URL("/login/admin/reset", request.url));
  }

  // Only ever follow a same-origin relative path — `next` arrives via a URL
  // query string, so treat it as untrusted input rather than a safe target.
  const safePath = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const destination = new URL(safePath, request.url);
  if (accessCode) {
    destination.searchParams.set("code", accessCode);
  }

  return NextResponse.redirect(destination);
}
