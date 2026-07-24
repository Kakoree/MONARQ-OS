"use server";

/**
 * V2 real-identity member entry, replacing the V1 anonymous-sign-in
 * shortcut. A member's route in is: admin creates a one-time access code,
 * it's delivered to them out of band (in person, as a letter — not
 * something this app does), and they redeem it while creating a real
 * account here. Admin login is untouched (app/login/admin/actions.ts).
 *
 * Account creation does not hard-require a valid code — same as the V1
 * flow it replaces, the actual gate is `redeem_access_code()` granting
 * 'active' status, enforced by app/(app)/layout.tsx on every request. A
 * signed-up-but-not-yet-activated member simply lands on /onboarding,
 * same as anyone who signed in without ever having a code.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteURL } from "@/lib/site-url";

function onboardingRedirectURL(accessCode: string): string {
  const url = new URL("/auth/callback", getSiteURL());
  url.searchParams.set("next", "/onboarding");
  if (accessCode) {
    url.searchParams.set("access_code", accessCode);
  }
  return url.toString();
}

export type SignUpState =
  | { status: "idle" }
  | { status: "check-email" }
  | { status: "error"; message: string }
  | undefined;

export async function signUpMember(
  _prevState: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!code) {
    return { status: "error", message: "Enter your access code." };
  }
  if (!email || !password) {
    return { status: "error", message: "Enter your email and a password." };
  }
  if (password.length < 8) {
    return { status: "error", message: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: onboardingRedirectURL(code) },
  });

  if (error) {
    return { status: "error", message: friendlySignUpError(error.message) };
  }

  // Email confirmation disabled in Supabase settings — a session already
  // exists, no inbox round-trip needed.
  if (data.session) {
    redirect(`/onboarding?code=${encodeURIComponent(code)}`);
  }

  return { status: "check-email" };
}

export type SignInState = { error: string } | undefined;

export async function signInMember(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Incorrect email or password." };
  }

  redirect("/");
}

export async function signInWithGoogle(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: onboardingRedirectURL(code) },
  });

  if (error || !data.url) {
    redirect("/login?error=google_unavailable");
  }

  redirect(data.url);
}

function friendlySignUpError(message: string): string {
  if (message.toLowerCase().includes("already registered")) {
    return "An account already exists for that email. Try signing in instead.";
  }
  return message;
}
