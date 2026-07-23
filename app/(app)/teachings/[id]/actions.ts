"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function toggleTeachingComplete(teachingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existing } = await supabase
    .from("teaching_progress")
    .select("id")
    .eq("teaching_id", teachingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("teaching_progress").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("teaching_progress")
      .insert({ teaching_id: teachingId, user_id: user.id });
  }

  revalidatePath("/teachings");
  revalidatePath(`/teachings/${teachingId}`);
}
