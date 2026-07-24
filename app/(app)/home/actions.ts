"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDailyOS } from "@/lib/habits";
import { consumeGraceToken } from "@/lib/grace-tokens";

export type AddHabitState = { error: string } | undefined;

export async function addHabit(
  _prevState: AddHabitState,
  formData: FormData
): Promise<AddHabitState> {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Enter a habit name." };
  }
  if (name.length > 80) {
    return { error: "Keep habit names under 80 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("habits")
    .insert({ user_id: user.id, name });

  if (error) {
    return { error: "Could not add that habit. Try again." };
  }

  revalidatePath("/home");
}

export async function removeHabit(habitId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Soft delete: check-ins reference habits with ON DELETE CASCADE, so a
  // hard delete would silently erase streak history for any day where this
  // was the only habit completed.
  await supabase
    .from("habits")
    .update({ is_active: false })
    .eq("id", habitId)
    .eq("user_id", user.id);

  revalidatePath("/home");
}

export async function toggleCheckIn(habitId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await supabase
    .from("habit_check_ins")
    .select("id")
    .eq("habit_id", habitId)
    .eq("user_id", user.id)
    .eq("completed_on", today)
    .maybeSingle();

  if (existing) {
    await supabase.from("habit_check_ins").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("habit_check_ins")
      .insert({ habit_id: habitId, user_id: user.id, completed_on: today });

    // Grace tokens are only ever earned on the check-in path, never on
    // un-checking — grant_grace_token itself no-ops past a 3-token
    // stockpile or a second grant the same day, so this is safe to call
    // on every 7-day milestone without extra bookkeeping here.
    const daily = await getDailyOS();
    if (daily && daily.streak > 0 && daily.streak % 7 === 0) {
      await supabase.rpc("grant_grace_token", { p_source: "streak_7" });
    }
  }

  revalidatePath("/home");
}

export async function recoverMissedDay(date: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await consumeGraceToken(date);
  revalidatePath("/home");
}
