import { createClient } from "@/lib/supabase/server";

export type ConsumeGraceTokenResult = { error: string } | { error: undefined };

export async function consumeGraceToken(date: string): Promise<ConsumeGraceTokenResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("consume_grace_token", { p_date: date });

  if (error) {
    return { error: friendlyConsumeError(error.message) };
  }

  return { error: undefined };
}

function friendlyConsumeError(message: string): string {
  if (message.includes("no grace tokens available")) {
    return "You don't have a grace token to spend.";
  }
  if (message.includes("already has a check-in")) {
    return "That day is already checked in.";
  }
  if (message.includes("already recovered")) {
    return "That day is already recovered.";
  }
  if (message.includes("outside the recovery window")) {
    return "That day is too far back to recover.";
  }
  if (message.includes("only past days")) {
    return "Only past days can be recovered.";
  }
  return "Could not recover that day. Try again.";
}
