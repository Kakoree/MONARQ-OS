"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";

export async function approveMentor(mentorId: string, userId: string) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const supabase = await createClient();
  await supabase
    .from("mentors")
    .update({
      is_approved: true,
      approved_at: new Date().toISOString(),
      approved_by: admin.id,
    })
    .eq("id", mentorId);

  await logAdminAction({
    action: "mentor_approved",
    targetTable: "mentors",
    targetId: mentorId,
  });

  await createNotification({
    userId,
    type: "mentor_approved",
    title: "You're an approved mentor",
    body: "Your mentor profile is now live in the directory.",
    actionUrl: "/mentors/apply",
  });

  revalidatePath("/admin/mentors");
  revalidatePath("/mentors");
}

export async function deactivateMentor(mentorId: string) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const supabase = await createClient();
  await supabase.from("mentors").update({ is_approved: false }).eq("id", mentorId);

  await logAdminAction({
    action: "mentor_deactivated",
    targetTable: "mentors",
    targetId: mentorId,
  });

  revalidatePath("/admin/mentors");
  revalidatePath("/mentors");
}
