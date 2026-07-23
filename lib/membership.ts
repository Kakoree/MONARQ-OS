import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { MembershipStatus, MemberRole } from "@/lib/supabase/types";

export async function getCurrentMembership(): Promise<{
  user: User | null;
  status: MembershipStatus | null;
  role: MemberRole | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, status: null, role: null };
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("status, role")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    user,
    status: membership?.status ?? null,
    role: membership?.role ?? null,
  };
}
