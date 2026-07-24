"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";

export type ChallengeFormState = { error: string } | undefined;

export async function createChallenge(
  _prevState: ChallengeFormState,
  formData: FormData
): Promise<ChallengeFormState> {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const xpReward = Number(formData.get("xp_reward") ?? 50);
  const startsAt = String(formData.get("starts_at") ?? "");
  const endsAt = String(formData.get("ends_at") ?? "");
  const isGroup = formData.get("is_group") === "on";

  if (!title) return { error: "Enter a title." };
  if (!description) return { error: "Enter a description." };
  if (!Number.isFinite(xpReward) || xpReward <= 0) {
    return { error: "XP reward must be a positive number." };
  }
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
    return { error: "End date must be after the start date." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .insert({
      title,
      description,
      xp_reward: xpReward,
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      is_group: isGroup,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Could not create that challenge. Try again." };
  }

  await logAdminAction({
    action: "challenge_created",
    targetTable: "challenges",
    targetId: data.id,
    metadata: { title, xp_reward: xpReward, is_group: isGroup },
  });

  revalidatePath("/admin/challenges");
}

export async function toggleChallengePublished(challengeId: string, nextPublished: boolean) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const supabase = await createClient();
  await supabase
    .from("challenges")
    .update({ is_published: nextPublished })
    .eq("id", challengeId);

  await logAdminAction({
    action: nextPublished ? "challenge_published" : "challenge_unpublished",
    targetTable: "challenges",
    targetId: challengeId,
  });

  revalidatePath("/admin/challenges");
}
