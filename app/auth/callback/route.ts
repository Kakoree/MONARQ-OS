import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const invite = requestUrl.searchParams.get("invite");

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

  // If sign-in started from the access-code step, redeem it now that a
  // session exists (redeem_access_code needs auth.uid()). Best-effort: if
  // this fails — bad, expired, or already-used code — the member still
  // lands in the app with a valid session and falls through to the existing
  // manual retry at /onboarding via app/(app)/layout.tsx's membership gate.
  if (invite) {
    await supabase.rpc("redeem_access_code", { p_code: invite });
  }

  return NextResponse.redirect(new URL("/", request.url));
}
