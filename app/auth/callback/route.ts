import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Only used by the admin password-reset bootstrap flow now
// (app/login/admin/actions.ts) — the V1 member entry no longer uses email
// at all (see app/login/temporary-v1-actions.ts).
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

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

  return NextResponse.redirect(new URL("/", request.url));
}
