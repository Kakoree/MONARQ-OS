"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";

// Uses the posts_admin_all RLS policy (Phase 8), which allows an admin to
// delete any post regardless of author — unlike the member-facing
// deletePost action in app/(app)/community/actions.ts, which is
// owner-scoped.
export async function removePost(postId: string) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", postId);

  await logAdminAction({
    action: "post_removed",
    targetTable: "posts",
    targetId: postId,
  });

  revalidatePath("/admin/moderation");
  revalidatePath("/community");
}
