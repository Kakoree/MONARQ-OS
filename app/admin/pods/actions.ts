"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export type PodFormState = { error: string } | undefined;

export async function createPod(
  _prevState: PodFormState,
  formData: FormData
): Promise<PodFormState> {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return { error: "Enter a pod name." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pods")
    .insert({ name, description: description || null })
    .select("id")
    .single();

  if (error) {
    return { error: "Could not create that pod. Try again." };
  }

  await logAdminAction({
    action: "pod_created",
    targetTable: "pods",
    targetId: data.id,
    metadata: { name },
  });

  revalidatePath("/admin/pods");
  revalidatePath("/pods");
}

export async function updatePod(
  podId: string,
  _prevState: PodFormState,
  formData: FormData
): Promise<PodFormState> {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return { error: "Enter a pod name." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("pods")
    .update({ name, description: description || null })
    .eq("id", podId);

  if (error) {
    return { error: "Could not update that pod. Try again." };
  }

  await logAdminAction({
    action: "pod_updated",
    targetTable: "pods",
    targetId: podId,
    metadata: { name },
  });

  revalidatePath("/admin/pods");
  revalidatePath("/pods");
}

export async function togglePodActive(podId: string, nextActive: boolean) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const supabase = await createClient();
  await supabase.from("pods").update({ is_active: nextActive }).eq("id", podId);

  await logAdminAction({
    action: nextActive ? "pod_activated" : "pod_deactivated",
    targetTable: "pods",
    targetId: podId,
  });

  revalidatePath("/admin/pods");
  revalidatePath("/pods");
}

// pod_members cascades from pods (0042), so this removes the roster too. No
// member-authored content lives in a pod at this phase — messaging is V3
// Phase 7 — so there is nothing else to orphan.
export async function deletePod(podId: string) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const supabase = await createClient();
  await supabase.from("pods").delete().eq("id", podId);

  await logAdminAction({
    action: "pod_deleted",
    targetTable: "pods",
    targetId: podId,
  });

  revalidatePath("/admin/pods");
  revalidatePath("/pods");
}

export type PodMemberFormState = { error: string } | undefined;

export async function addPodMember(
  podId: string,
  _prevState: PodMemberFormState,
  formData: FormData
): Promise<PodMemberFormState> {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const userId = String(formData.get("user_id") ?? "");
  if (!userId) return { error: "Pick a member to add." };

  const supabase = await createClient();

  const { data: pod } = await supabase
    .from("pods")
    .select("name")
    .eq("id", podId)
    .maybeSingle();

  const { error } = await supabase
    .from("pod_members")
    .insert({ pod_id: podId, user_id: userId });

  if (error) {
    // unique (pod_id, user_id) from 0042
    if (error.code === "23505") {
      return { error: "That member is already in this pod." };
    }
    return { error: "Could not add that member. Try again." };
  }

  await logAdminAction({
    action: "pod_member_added",
    targetTable: "pod_members",
    targetId: podId,
    metadata: { user_id: userId },
  });

  await createNotification({
    userId,
    type: "pod_added",
    title: "You've been added to a pod",
    body: pod?.name
      ? `You're now part of ${pod.name}.`
      : "You're now part of an accountability pod.",
    actionUrl: `/pods/${podId}`,
  });

  revalidatePath("/admin/pods");
  revalidatePath("/pods");
}

export async function removePodMember(podId: string, userId: string) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const supabase = await createClient();
  await supabase
    .from("pod_members")
    .delete()
    .eq("pod_id", podId)
    .eq("user_id", userId);

  await logAdminAction({
    action: "pod_member_removed",
    targetTable: "pod_members",
    targetId: podId,
    metadata: { user_id: userId },
  });

  revalidatePath("/admin/pods");
  revalidatePath("/pods");
}
