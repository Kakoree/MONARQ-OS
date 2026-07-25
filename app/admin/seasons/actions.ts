"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";

export type SeasonFormState = { error: string } | undefined;

export async function createSeason(
  _prevState: SeasonFormState,
  formData: FormData
): Promise<SeasonFormState> {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const startsAt = String(formData.get("starts_at") ?? "");
  const endsAt = String(formData.get("ends_at") ?? "");

  if (!name) return { error: "Enter a season name." };
  if (!startsAt || !endsAt) return { error: "Enter a start and end date." };
  if (new Date(endsAt) <= new Date(startsAt)) {
    return { error: "End date must be after the start date." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seasons")
    .insert({ name, starts_at: startsAt, ends_at: endsAt })
    .select("id")
    .single();

  if (error) {
    return { error: "Could not create that season. Try again." };
  }

  await logAdminAction({
    action: "season_created",
    targetTable: "seasons",
    targetId: data.id,
    metadata: { name, starts_at: startsAt, ends_at: endsAt },
  });

  revalidatePath("/admin/seasons");
}

export async function setActiveSeason(seasonId: string) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const supabase = await createClient();
  await supabase.from("seasons").update({ is_active: false }).neq("id", seasonId);
  await supabase.from("seasons").update({ is_active: true }).eq("id", seasonId);

  await logAdminAction({
    action: "season_activated",
    targetTable: "seasons",
    targetId: seasonId,
  });

  revalidatePath("/admin/seasons");
}

export async function deactivateAllSeasons() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const supabase = await createClient();
  await supabase.from("seasons").update({ is_active: false }).eq("is_active", true);

  await logAdminAction({ action: "season_deactivated_all" });

  revalidatePath("/admin/seasons");
}

export type TierFormState = { error: string } | undefined;

export async function createTier(
  _prevState: TierFormState,
  formData: FormData
): Promise<TierFormState> {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const minPoints = Number(formData.get("min_points") ?? 0);
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!name) return { error: "Enter a tier name." };
  if (!Number.isFinite(minPoints) || minPoints < 0) {
    return { error: "Minimum points must be zero or more." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tiers")
    .insert({ name, min_points: minPoints, sort_order: sortOrder })
    .select("id")
    .single();

  if (error) {
    return { error: "Could not create that tier. Try again." };
  }

  await logAdminAction({
    action: "tier_created",
    targetTable: "tiers",
    targetId: data.id,
    metadata: { name, min_points: minPoints, sort_order: sortOrder },
  });

  revalidatePath("/admin/seasons");
}

export async function updateTier(
  tierId: string,
  _prevState: TierFormState,
  formData: FormData
): Promise<TierFormState> {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const minPoints = Number(formData.get("min_points") ?? 0);
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!name) return { error: "Enter a tier name." };
  if (!Number.isFinite(minPoints) || minPoints < 0) {
    return { error: "Minimum points must be zero or more." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tiers")
    .update({ name, min_points: minPoints, sort_order: sortOrder })
    .eq("id", tierId);

  if (error) {
    return { error: "Could not update that tier. Try again." };
  }

  await logAdminAction({
    action: "tier_updated",
    targetTable: "tiers",
    targetId: tierId,
    metadata: { name, min_points: minPoints, sort_order: sortOrder },
  });

  revalidatePath("/admin/seasons");
}

// drops.required_tier_id is `on delete set null` (0040), so removing a
// tier safely un-gates any drop pointing at it rather than erroring.
export async function deleteTier(tierId: string) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const supabase = await createClient();
  await supabase.from("tiers").delete().eq("id", tierId);

  await logAdminAction({
    action: "tier_deleted",
    targetTable: "tiers",
    targetId: tierId,
  });

  revalidatePath("/admin/seasons");
  revalidatePath("/admin/drops");
  revalidatePath("/drops");
  revalidatePath("/home");
}
