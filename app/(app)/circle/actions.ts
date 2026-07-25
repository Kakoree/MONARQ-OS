"use server";

import { revalidatePath } from "next/cache";
import { respondConnection } from "@/lib/connections";
import { sendDirectMessage } from "@/lib/messages";

export async function respondToConnection(connectionId: string, accept: boolean) {
  await respondConnection(connectionId, accept);
  revalidatePath("/circle");
}

export type DirectMessageState = { error: string } | undefined;

export async function sendDirectMessageAction(
  recipientId: string,
  _prevState: DirectMessageState,
  formData: FormData
): Promise<DirectMessageState> {
  const body = String(formData.get("body") ?? "");
  const result = await sendDirectMessage(recipientId, body);
  if (result.error) return { error: result.error };

  revalidatePath(`/circle/${recipientId}`);
}
