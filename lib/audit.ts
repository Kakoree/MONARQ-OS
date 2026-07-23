import { createClient } from "@/lib/supabase/server";

// Best-effort logging — a failed audit write should never block the
// underlying admin action from succeeding, so errors are swallowed rather
// than surfaced. Not transactional with the action it records.
export async function logAdminAction(params: {
  action: string;
  targetTable?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("audit_log").insert({
    actor_id: user.id,
    action: params.action,
    target_table: params.targetTable ?? null,
    target_id: params.targetId ?? null,
    metadata: params.metadata ?? null,
  });
}
