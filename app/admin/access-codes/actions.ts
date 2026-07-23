"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";

export type AccessCodeFormState = { error: string } | undefined;

export async function createAccessCode(
  _prevState: AccessCodeFormState,
  formData: FormData
): Promise<AccessCodeFormState> {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/login");
  }

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const maxUses = Number(formData.get("max_uses") ?? 1);

  if (!code) {
    return { error: "Enter a code." };
  }
  if (!Number.isFinite(maxUses) || maxUses < 1) {
    return { error: "Max uses must be at least 1." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("access_codes")
    .insert({ code, max_uses: maxUses, created_by: admin.id })
    .select("id")
    .single();

  if (error) {
    return { error: "Could not create that code — it may already exist." };
  }

  await logAdminAction({
    action: "access_code_created",
    targetTable: "access_codes",
    targetId: data.id,
    metadata: { code, max_uses: maxUses },
  });

  revalidatePath("/admin/access-codes");
}

export async function deactivateAccessCode(codeId: string) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase
    .from("access_codes")
    .update({ is_active: false })
    .eq("id", codeId);

  await logAdminAction({
    action: "access_code_deactivated",
    targetTable: "access_codes",
    targetId: codeId,
  });

  revalidatePath("/admin/access-codes");
}
