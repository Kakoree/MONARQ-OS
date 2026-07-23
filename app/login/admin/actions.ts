"use server";

/**
 * PROPER ADMIN AUTH FLOW — not the V1 temporary shortcut.
 *
 * Standard Supabase email+password authentication. This intentionally does
 * NOT check role or membership status here — that's authorization, not
 * authentication, and stays exactly where it already lived:
 * requireAdmin() (lib/admin.ts), enforced server-side on every /admin/*
 * request via app/admin/layout.tsx. A non-admin who successfully signs in
 * here just lands in the regular member app, same as anyone else.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteURL } from "@/lib/site-url";

export type AdminSignInState = { error: string } | undefined;

export async function signInAdmin(
  _prevState: AdminSignInState,
  formData: FormData
): Promise<AdminSignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Incorrect email or password." };
  }

  redirect("/");
}

export type PasswordResetState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "error"; message: string };

// One-time bootstrap: no admin account has a password set yet, since every
// account so far was created via magic-link/OTP, which never sets one.
// This sends a single reset email — a one-time setup action, not a
// per-login email, so it doesn't reintroduce the per-sign-in rate-limit
// problem the password switch was meant to avoid.
export async function requestAdminPasswordReset(
  _prevState: PasswordResetState,
  formData: FormData
): Promise<PasswordResetState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { status: "error", message: "Enter your email." };
  }

  const supabase = await createClient();
  const redirectURL = new URL("/auth/callback", getSiteURL());
  redirectURL.searchParams.set("next", "set-password");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectURL.toString(),
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "sent" };
}
