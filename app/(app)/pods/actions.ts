"use server";

import { revalidatePath } from "next/cache";
import { postPodMessage, deletePodMessage } from "@/lib/messages";

export type PodMessageState = { error: string } | undefined;

export async function postPodMessageAction(
  podId: string,
  _prevState: PodMessageState,
  formData: FormData
): Promise<PodMessageState> {
  const body = String(formData.get("body") ?? "");
  const result = await postPodMessage(podId, body);
  if (result.error) return { error: result.error };

  revalidatePath(`/pods/${podId}`);
}

export async function deletePodMessageAction(podId: string, messageId: string) {
  await deletePodMessage(messageId);
  revalidatePath(`/pods/${podId}`);
}
