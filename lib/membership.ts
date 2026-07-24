import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { MembershipStatus, MemberRole } from "@/lib/supabase/types";

export async function getCurrentMembership(): Promise<{
  user: User | null;
  status: MembershipStatus | null;
  role: MemberRole | null;
  onboardingCompletedAt: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, status: null, role: null, onboardingCompletedAt: null };
  }

  const [{ data: membership, error }, { data: profile }] = await Promise.all([
    supabase
      .from("memberships")
      .select("status, role")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (error) {
    console.error("getCurrentMembership query failed:", error.code, error.message);
  }

  return {
    user,
    status: membership?.status ?? null,
    role: membership?.role ?? null,
    onboardingCompletedAt: profile?.onboarding_completed_at ?? null,
  };
}
