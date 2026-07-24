"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";

export type DropFormState = { error: string } | undefined;

export async function createDrop(
  _prevState: DropFormState,
  formData: FormData
): Promise<DropFormState> {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const isKeyDrop = formData.get("is_key_drop") === "on";
  const priceRaw = String(formData.get("price_cents") ?? "");
  const externalUrl = String(formData.get("external_url") ?? "").trim();
  const availableFrom = String(formData.get("available_from") ?? "");
  const availableUntil = String(formData.get("available_until") ?? "");
  const requiredTierId = String(formData.get("required_tier_id") ?? "");
  const earlyAccessHours = Number(formData.get("early_access_hours") ?? 0);

  if (!title) return { error: "Enter a title." };
  if (!description) return { error: "Enter a description." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drops")
    .insert({
      title,
      description,
      image_url: imageUrl || null,
      is_key_drop: isKeyDrop,
      price_cents: priceRaw ? Math.round(Number(priceRaw) * 100) : null,
      external_url: externalUrl || null,
      available_from: availableFrom || null,
      available_until: availableUntil || null,
      required_tier_id: requiredTierId || null,
      early_access_hours: Number.isFinite(earlyAccessHours) ? earlyAccessHours : 0,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Could not create that drop. Try again." };
  }

  await logAdminAction({
    action: "drop_created",
    targetTable: "drops",
    targetId: data.id,
    metadata: { title, is_key_drop: isKeyDrop },
  });

  revalidatePath("/admin/drops");
  revalidatePath("/drops");
}

export async function toggleDropPublished(dropId: string, nextPublished: boolean) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const supabase = await createClient();
  await supabase.from("drops").update({ is_published: nextPublished }).eq("id", dropId);

  await logAdminAction({
    action: nextPublished ? "drop_published" : "drop_unpublished",
    targetTable: "drops",
    targetId: dropId,
  });

  revalidatePath("/admin/drops");
  revalidatePath("/drops");
}

export async function toggleDropSoldOut(dropId: string, nextSoldOut: boolean) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const supabase = await createClient();
  await supabase.from("drops").update({ is_sold_out: nextSoldOut }).eq("id", dropId);

  await logAdminAction({
    action: nextSoldOut ? "drop_marked_sold_out" : "drop_marked_available",
    targetTable: "drops",
    targetId: dropId,
  });

  revalidatePath("/admin/drops");
  revalidatePath("/drops");
}
