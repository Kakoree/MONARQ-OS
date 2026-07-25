"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type RedeemState = { error: string } | undefined;

export async function redeemAccessCode(
  _prevState: RedeemState,
  formData: FormData
): Promise<RedeemState> {
  const code = String(formData.get("code") ?? "").trim();

  if (!code) {
    return { error: "Enter a code." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Was a silent redirect("/login") — which looks identical to "the page
    // just refreshed" with no explanation. Surfacing this explicitly so a
    // session problem is distinguishable from a genuinely bad code.
    return {
      error: "Your session isn't active. Refresh the page and try again.",
    };
  }

  const { data, error } = await supabase.rpc("redeem_access_code", {
    p_code: code,
  });

  if (error) {
    return { error: friendlyRedemptionError(error.message) };
  }

  // A wrong code no longer raises — it returns the membership unchanged, so
  // the failed attempt it logs survives instead of being rolled back with
  // the exception (see 0044). Anything short of 'active' means it didn't
  // take.
  if (data !== "active") {
    return { error: "That code is invalid or has expired." };
  }

  // Redemption only activates membership — it doesn't complete onboarding.
  // Reload the same page so the step router below picks the next step.
  redirect("/onboarding");
}

function friendlyRedemptionError(message: string): string {
  if (message.includes("invalid or expired")) {
    return "That code is invalid or has expired.";
  }
  if (message.includes("already redeemed")) {
    return "You've already redeemed this code.";
  }
  if (message.includes("no remaining uses")) {
    return "That code has already been fully used.";
  }
  if (message.includes("contact support")) {
    return message;
  }
  return "Something went wrong redeeming that code. Please try again.";
}

export type IdentityMarkerState = { error: string } | undefined;

export async function setIdentityMarker(
  _prevState: IdentityMarkerState,
  formData: FormData
): Promise<IdentityMarkerState> {
  const markerName = String(formData.get("marker") ?? "").trim();

  if (!markerName) {
    return { error: "Choose an identity marker." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Re-validate against the active marker list server-side rather than
  // trusting the submitted name outright — the form only ever renders
  // active markers, but a submitted value should still be checked before
  // it's written to a profile.
  const { data: marker } = await supabase
    .from("identity_markers")
    .select("name")
    .eq("name", markerName)
    .eq("is_active", true)
    .maybeSingle();

  if (!marker) {
    return { error: "That identity marker isn't available anymore. Choose another." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ identity_marker: marker.name })
    .eq("id", user.id);

  if (error) {
    return { error: "Could not save that. Try again." };
  }

  redirect("/onboarding");
}

export type FirstHabitState = { error: string } | undefined;

export async function completeOnboarding(
  _prevState: FirstHabitState,
  formData: FormData
): Promise<FirstHabitState> {
  const habitName = String(formData.get("habit") ?? "").trim();

  if (!habitName) {
    return { error: "Enter a habit to track." };
  }
  if (habitName.length > 80) {
    return { error: "Keep habit names under 80 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, identity_marker")
    .eq("id", user.id)
    .single();

  if (!profile?.identity_marker) {
    // Shouldn't be reachable — the step router only shows this step once an
    // identity marker is already set — but guards against a direct POST.
    return { error: "Choose an identity marker first." };
  }

  const { error: habitError } = await supabase
    .from("habits")
    .insert({ user_id: user.id, name: habitName });

  if (habitError) {
    return { error: "Could not add that habit. Try again." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("id", user.id);

  if (profileError) {
    return { error: "Could not complete onboarding. Try again." };
  }

  await supabase.rpc("create_notification", {
    p_user_id: user.id,
    p_type: "welcome",
    p_title: "Welcome to MONARQ",
    p_body: `You're in as a ${profile.identity_marker}. First habit locked: ${habitName}.`,
    p_action_url: "/home",
  });

  const displayName = profile.display_name ?? "A new member";
  await supabase.from("posts").insert({
    user_id: user.id,
    body: `${displayName} just joined MONARQ as a ${profile.identity_marker}. First habit: ${habitName}.`,
  });

  redirect("/onboarding");
}
