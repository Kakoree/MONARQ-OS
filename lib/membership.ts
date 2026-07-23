import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { MembershipStatus, MemberRole } from "@/lib/supabase/types";

export async function getCurrentMembership(): Promise<{
  user: User | null;
  status: MembershipStatus | null;
  role: MemberRole | null;
  debugError: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, status: null, role: null, debugError: null };
  }

  const { data: membership, error } = await supabase
    .from("memberships")
    .select("status, role")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    user,
    status: membership?.status ?? null,
    role: membership?.role ?? null,
    // TEMPORARY V1 diagnostic — surfaced on /onboarding so a query failure
    // (e.g. RLS denial) is distinguishable from a genuinely missing row
    // without needing Vercel log access. Remove once the admin-redirect
    // investigation is closed.
    debugError: error ? `${error.code ?? "?"}: ${error.message}` : null,
  };
}
