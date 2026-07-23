"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";

type SettableStatus = "active" | "suspended" | "revoked";

export async function setMemberStatus(userId: string, status: SettableStatus) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/login");
  }

  // No self-service lockout: an admin can't suspend or revoke themselves
  // through this panel. The UI already omits these controls on the admin's
  // own row; this is the server-side backstop.
  if (userId === admin.id) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("memberships").update({ status }).eq("user_id", userId);

  await logAdminAction({
    action: `membership_status_set_${status}`,
    targetTable: "memberships",
    targetId: userId,
    metadata: { status },
  });

  revalidatePath("/admin/members");
}
