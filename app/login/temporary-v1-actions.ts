"use server";

/**
 * TEMPORARY V1 TESTING SHORTCUT — NOT FOR PRODUCTION.
 *
 * This file is the entire member-entry auth model for V1 testing: an access
 * code, and nothing else. It works by starting a Supabase Anonymous
 * Sign-in session (a real, RLS-compliant session with no verified
 * identity), then handing off to the existing /onboarding redemption flow
 * (app/onboarding/actions.ts) — the same, already-proven
 * redeem_access_code() path real accounts have used since Phase 3.
 *
 * Deliberately does NOT attempt redemption itself in the same call that
 * creates the session — every other auth flow in this app signs in, lets
 * the page reload, then acts on the now-fully-established session on a
 * fresh request. This does the same, rather than being the one place that
 * tries to use a session in the same instant it's created.
 *
 * What this deliberately does NOT do: verify the person is who they claim,
 * verify they're a real human distinct from anyone else who has the same
 * code, or prevent unlimited anonymous accounts from being created by
 * anyone probing this form. See the chat summary for the full list of
 * tradeoffs and what replacing this for V2 requires.
 *
 * Requires "Anonymous sign-ins" enabled in Supabase Dashboard →
 * Authentication — off by default, not something this code can toggle.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AccessCodeEntryState = { error: string } | undefined;

export async function enterWithAccessCode(
  _prevState: AccessCodeEntryState,
  formData: FormData
): Promise<AccessCodeEntryState> {
  const code = String(formData.get("code") ?? "").trim();

  if (!code) {
    return { error: "Enter your access code." };
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInAnonymously();

  if (signInError) {
    // Surfacing the real Supabase error (rather than a generic message) is
    // deliberate for V1 testing — the most likely failure here is
    // "Anonymous sign-ins are disabled", which is much faster to diagnose
    // if it isn't hidden behind a polished generic string.
    return { error: signInError.message };
  }

  // Hand off to /onboarding on a fresh request rather than redeeming here —
  // see file comment above. Carry the code through so they don't have to
  // retype it.
  redirect(`/onboarding?code=${encodeURIComponent(code)}`);
}
