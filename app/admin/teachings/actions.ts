"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";
import type { MemberRole } from "@/lib/supabase/types";

const REQUIRED_ROLES: MemberRole[] = ["guest", "member", "moderator", "admin"];

function parseRequiredRole(value: FormDataEntryValue | null): MemberRole {
  const role = String(value ?? "member");
  return (REQUIRED_ROLES as string[]).includes(role) ? (role as MemberRole) : "member";
}

export type TeachingCategoryFormState = { error: string } | undefined;

export async function createTeachingCategory(
  _prevState: TeachingCategoryFormState,
  formData: FormData
): Promise<TeachingCategoryFormState> {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const mentorId = String(formData.get("mentor_id") ?? "");

  if (!name) return { error: "Enter a track name." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teaching_categories")
    .insert({ name, sort_order: sortOrder, mentor_id: mentorId || null })
    .select("id")
    .single();

  if (error) {
    return { error: "Could not create that track. Try again." };
  }

  await logAdminAction({
    action: "teaching_category_created",
    targetTable: "teaching_categories",
    targetId: data.id,
    metadata: { name },
  });

  revalidatePath("/admin/teachings");
  revalidatePath("/teachings");
}

export async function updateTeachingCategory(
  categoryId: string,
  _prevState: TeachingCategoryFormState,
  formData: FormData
): Promise<TeachingCategoryFormState> {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const mentorId = String(formData.get("mentor_id") ?? "");

  if (!name) return { error: "Enter a track name." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("teaching_categories")
    .update({ name, sort_order: sortOrder, mentor_id: mentorId || null })
    .eq("id", categoryId);

  if (error) {
    return { error: "Could not update that track. Try again." };
  }

  await logAdminAction({
    action: "teaching_category_updated",
    targetTable: "teaching_categories",
    targetId: categoryId,
    metadata: { name },
  });

  revalidatePath("/admin/teachings");
  revalidatePath("/teachings");
}

export type TeachingFormState = { error: string } | undefined;

export async function createTeaching(
  _prevState: TeachingFormState,
  formData: FormData
): Promise<TeachingFormState> {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const categoryId = String(formData.get("category_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const requiredRole = parseRequiredRole(formData.get("required_role"));
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!title) return { error: "Enter a title." };
  if (!summary) return { error: "Enter a summary." };
  if (!body) return { error: "Enter the teaching body." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teachings")
    .insert({
      category_id: categoryId || null,
      title,
      summary,
      required_role: requiredRole,
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Could not create that teaching. Try again." };
  }

  const { error: contentError } = await supabase
    .from("teaching_content")
    .insert({ teaching_id: data.id, body });

  if (contentError) {
    return { error: "Created the teaching, but saving its body failed. Edit it to retry." };
  }

  await logAdminAction({
    action: "teaching_created",
    targetTable: "teachings",
    targetId: data.id,
    metadata: { title, required_role: requiredRole },
  });

  revalidatePath("/admin/teachings");
  revalidatePath("/teachings");
}

export async function updateTeaching(
  teachingId: string,
  _prevState: TeachingFormState,
  formData: FormData
): Promise<TeachingFormState> {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const categoryId = String(formData.get("category_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const requiredRole = parseRequiredRole(formData.get("required_role"));
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!title) return { error: "Enter a title." };
  if (!summary) return { error: "Enter a summary." };
  if (!body) return { error: "Enter the teaching body." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("teachings")
    .update({
      category_id: categoryId || null,
      title,
      summary,
      required_role: requiredRole,
      sort_order: sortOrder,
    })
    .eq("id", teachingId);

  if (error) {
    return { error: "Could not update that teaching. Try again." };
  }

  const { error: contentError } = await supabase
    .from("teaching_content")
    .upsert({ teaching_id: teachingId, body });

  if (contentError) {
    return { error: "Updated the teaching, but saving its body failed. Try again." };
  }

  await logAdminAction({
    action: "teaching_updated",
    targetTable: "teachings",
    targetId: teachingId,
    metadata: { title, required_role: requiredRole },
  });

  revalidatePath("/admin/teachings");
  revalidatePath("/teachings");
}

export async function toggleTeachingPublished(teachingId: string, nextPublished: boolean) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const supabase = await createClient();
  await supabase.from("teachings").update({ is_published: nextPublished }).eq("id", teachingId);

  await logAdminAction({
    action: nextPublished ? "teaching_published" : "teaching_unpublished",
    targetTable: "teachings",
    targetId: teachingId,
  });

  revalidatePath("/admin/teachings");
  revalidatePath("/teachings");
}
