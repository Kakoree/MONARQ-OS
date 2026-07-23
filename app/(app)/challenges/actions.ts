"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function joinChallenge(challengeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("challenge_participation")
    .insert({ user_id: user.id, challenge_id: challengeId });

  revalidatePath("/challenges");
  revalidatePath(`/challenges/${challengeId}`);
}

export async function completeChallenge(challengeId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Errors here (already completed, not joined, challenge closed) only
  // happen from a race or direct tampering — the UI never shows this action
  // unless it should already be valid. Revalidating reflects true state
  // either way, so there's nothing useful to surface beyond that.
  await supabase.rpc("complete_challenge", { p_challenge_id: challengeId });

  revalidatePath("/challenges");
  revalidatePath(`/challenges/${challengeId}`);
  revalidatePath("/leaderboard");
}
