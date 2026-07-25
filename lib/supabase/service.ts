import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Service-role client — bypasses RLS entirely. Only for backend jobs that
// legitimately need to act across every user's data (e.g. the cron nudge
// scan in lib/nudges.ts), never for anything reachable from a user request.
// Not session-bound, so this must never be used inside a route that also
// handles a signed-in user's own request.
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
