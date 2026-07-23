"use server";

import { createClient } from "@/lib/supabase/server";
import { getSiteURL } from "@/lib/site-url";

export type SignInState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "error"; message: string };

// Shared by the member entry (app/login, with an access code carried
// through) and the admin/returning-member entry (app/login/admin, email
// only). The `code` field is optional — when present, it's carried through
// the magic-link redirect as an `invite` query param and redeemed
// automatically once a session exists (see app/auth/callback/route.ts).
export async function sendSignInLink(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();

  if (!email) {
    return { status: "error", message: "Enter your email." };
  }

  const supabase = await createClient();

  const redirectURL = new URL("/auth/callback", getSiteURL());
  if (code) {
    redirectURL.searchParams.set("invite", code);
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectURL.toString(),
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "sent" };
}
