"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SetPasswordState =
  | { status: "idle" }
  | { status: "error"; message: string };

// Assumes a session already exists — app/auth/callback/route.ts exchanges
// the reset-email code and lands the visitor here already authenticated.
export async function setAdminPassword(
  _prevState: SetPasswordState,
  formData: FormData
): Promise<SetPasswordState> {
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return { status: "error", message: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login/admin");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      status: "error",
      message: "Could not set password. Try the reset link again.",
    };
  }

  redirect("/");
}
