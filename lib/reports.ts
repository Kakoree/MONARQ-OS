import { createClient } from "@/lib/supabase/server";

export type CreateReportResult = { error: string } | { error: undefined };

export async function createReport(params: {
  reportedUserId: string;
  reason: string;
  context?: string;
}): Promise<CreateReportResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You need to be signed in to report a member." };
  if (user.id === params.reportedUserId) {
    return { error: "You can't report yourself." };
  }
  if (!params.reason.trim()) {
    return { error: "Describe what happened." };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_user_id: params.reportedUserId,
    reason: params.reason.trim(),
    context: params.context?.trim() || null,
  });

  if (error) {
    return { error: "Could not submit that report. Try again." };
  }

  return { error: undefined };
}
