"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";

export type IdentityMarkerFormState = { error: string } | undefined;

export async function createIdentityMarker(
  _prevState: IdentityMarkerFormState,
  formData: FormData
): Promise<IdentityMarkerFormState> {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!name) {
    return { error: "Enter a name." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("identity_markers")
    .insert({
      name,
      description: description || null,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Could not create that marker — it may already exist." };
  }

  await logAdminAction({
    action: "identity_marker_created",
    targetTable: "identity_markers",
    targetId: data.id,
    metadata: { name },
  });

  revalidatePath("/admin/identity-markers");
}

export async function toggleIdentityMarkerActive(markerId: string, nextActive: boolean) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase
    .from("identity_markers")
    .update({ is_active: nextActive })
    .eq("id", markerId);

  await logAdminAction({
    action: nextActive ? "identity_marker_activated" : "identity_marker_deactivated",
    targetTable: "identity_markers",
    targetId: markerId,
  });

  revalidatePath("/admin/identity-markers");
}
