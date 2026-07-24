"use server";

import { revalidatePath } from "next/cache";
import { respondConnection } from "@/lib/connections";

export async function respondToConnection(connectionId: string, accept: boolean) {
  await respondConnection(connectionId, accept);
  revalidatePath("/circle");
}
