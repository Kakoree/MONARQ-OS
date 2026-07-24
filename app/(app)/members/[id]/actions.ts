"use server";

import { revalidatePath } from "next/cache";
import { requestConnection } from "@/lib/connections";
import { createReport } from "@/lib/reports";

export type ConnectFormState = { error: string } | undefined;

export async function connectAction(
  recipientId: string,
  _prevState: ConnectFormState,
  _formData: FormData
): Promise<ConnectFormState> {
  const result = await requestConnection(recipientId);
  if (result.error) return { error: result.error };

  revalidatePath(`/members/${recipientId}`);
  revalidatePath("/circle");
}

export type ReportFormState = { error: string; success?: boolean } | undefined;

export async function reportAction(
  reportedUserId: string,
  _prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const reason = String(formData.get("reason") ?? "");
  const context = String(formData.get("context") ?? "");

  const result = await createReport({ reportedUserId, reason, context });
  if (result.error) return { error: result.error };

  return { error: "", success: true };
}
