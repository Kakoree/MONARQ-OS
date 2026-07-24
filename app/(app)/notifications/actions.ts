"use server";

import { revalidatePath } from "next/cache";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications";

export async function markNotificationReadAction(id: string) {
  await markNotificationRead(id);
  revalidatePath("/", "layout");
}

export async function markAllNotificationsReadAction() {
  await markAllNotificationsRead();
  revalidatePath("/", "layout");
}
