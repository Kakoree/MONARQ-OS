"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type RedeemState = { error: string } | undefined;

export async function redeemAccessCode(
  _prevState: RedeemState,
  formData: FormData
): Promise<RedeemState> {
  const code = String(formData.get("code") ?? "").trim();

  if (!code) {
    return { error: "Enter a code." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.rpc("redeem_access_code", {
    p_code: code,
  });

  if (error) {
    return { error: friendlyRedemptionError(error.message) };
  }

  redirect("/");
}

function friendlyRedemptionError(message: string): string {
  if (message.includes("invalid or expired")) {
    return "That code is invalid or has expired.";
  }
  if (message.includes("already redeemed")) {
    return "You've already redeemed this code.";
  }
  if (message.includes("no remaining uses")) {
    return "That code has already been fully used.";
  }
  if (message.includes("contact support")) {
    return message;
  }
  return "Something went wrong redeeming that code. Please try again.";
}
