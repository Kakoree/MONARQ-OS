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
    // Was a silent redirect("/login") — which looks identical to "the page
    // just refreshed" with no explanation. Surfacing this explicitly so a
    // session problem is distinguishable from a genuinely bad code.
    return {
      error: "Your session isn't active. Refresh the page and try again.",
    };
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
