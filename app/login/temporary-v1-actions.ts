"use server";

/**
 * TEMPORARY V1 TESTING SHORTCUT — NOT FOR PRODUCTION.
 *
 * This file is the entire member-entry auth model for V1 testing: an access
 * code, and nothing else. It works by starting a Supabase Anonymous
 * Sign-in session (a real, RLS-compliant session with no verified
 * identity), then redeeming the code against it with the existing
 * redeem_access_code() RPC — the same function the real onboarding flow
 * has used since Phase 3. No new database objects, no new RLS, no new
 * privileged credential.
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

  const { error: redeemError } = await supabase.rpc("redeem_access_code", {
    p_code: code,
  });

  if (redeemError) {
    // They now have a real (anonymous) session with a pending membership.
    // /onboarding already handles "authenticated but not yet active" and
    // lets them retry a different code — reuse that instead of duplicating
    // retry UI here.
    redirect("/onboarding");
  }

  redirect("/");
}
