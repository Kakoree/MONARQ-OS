import { redirect } from "next/navigation";
import { getCurrentMembership } from "@/lib/membership";
import { getActiveIdentityMarkers } from "@/lib/identity-markers";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./OnboardingForm";
import { IdentityMarkerStep } from "./IdentityMarkerStep";
import { FirstHabitStep } from "./FirstHabitStep";
import { WelcomeStep } from "./WelcomeStep";
import { Card } from "@/components/ui/Card";

const STEP_COPY = {
  code: {
    heading: "Enter your access code",
    subtext:
      "MONARQ is invite-only. Enter the code you were given to activate your membership.",
  },
  marker: {
    heading: "Who are you here as?",
    subtext: "Pick the identity that fits how you show up. You can only pick one.",
  },
  habit: {
    heading: "Lock in your first habit",
    subtext: "One habit, right now — before you see anything else.",
  },
  welcome: {
    heading: "Welcome to MONARQ",
    subtext: null as string | null,
  },
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { user, status } = await getCurrentMembership();
  const { code } = await searchParams;

  if (!user) redirect("/login");
  if (status === "suspended" || status === "revoked") redirect("/pending");

  if (status !== "active") {
    return (
      <OnboardingShell heading={STEP_COPY.code.heading} subtext={STEP_COPY.code.subtext}>
        <OnboardingForm defaultCode={code} />
      </OnboardingShell>
    );
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("identity_marker, onboarding_completed_at")
    .eq("id", user.id)
    .single();

  if (!profile?.identity_marker) {
    const markers = await getActiveIdentityMarkers();
    return (
      <OnboardingShell heading={STEP_COPY.marker.heading} subtext={STEP_COPY.marker.subtext}>
        <IdentityMarkerStep markers={markers} />
      </OnboardingShell>
    );
  }

  if (!profile.onboarding_completed_at) {
    return (
      <OnboardingShell heading={STEP_COPY.habit.heading} subtext={STEP_COPY.habit.subtext}>
        <FirstHabitStep />
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell heading={STEP_COPY.welcome.heading} subtext={STEP_COPY.welcome.subtext}>
      <WelcomeStep identityMarker={profile.identity_marker} />
    </OnboardingShell>
  );
}

function OnboardingShell({
  heading,
  subtext,
  children,
}: {
  heading: string;
  subtext: string | null;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <Card className="w-full max-w-md">
        <span className="font-display text-2xl tracking-[0.2em] text-paper">
          MONARQ
        </span>
        <h1 className="mt-4 text-lg font-medium text-paper">{heading}</h1>
        {subtext && <p className="mt-1 text-sm text-stone">{subtext}</p>}
        <div className="mt-6">{children}</div>
      </Card>
    </main>
  );
}
