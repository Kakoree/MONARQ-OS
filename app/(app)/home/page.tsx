import { getDailyOS, getCompletionTrend } from "@/lib/habits";
import { getOwnProfile } from "@/lib/profile";
import { getChallenges } from "@/lib/challenges";
import { getLeaderboard } from "@/lib/leaderboard";
import { getEvents } from "@/lib/events";
import { getFeed } from "@/lib/community";
import { getCurrentMembership } from "@/lib/membership";
import { progressToNextLevel } from "@/lib/progression";
import { Card } from "@/components/ui/Card";
import { HabitRow } from "@/components/home/HabitRow";
import { CompletionRing } from "@/components/home/CompletionRing";
import { CompletionTrendChart } from "@/components/home/CompletionTrendChart";
import { WeeklyConsistencyChart } from "@/components/home/WeeklyConsistencyChart";
import { StreakDots } from "@/components/home/StreakDots";
import { ProgressOverview } from "@/components/home/ProgressOverview";
import { MilestonesList } from "@/components/home/MilestonesList";
import { LeaderboardPreview } from "@/components/home/LeaderboardPreview";
import { UpcomingEventsPreview } from "@/components/home/UpcomingEventsPreview";
import { CommunityFeedPreview } from "@/components/home/CommunityFeedPreview";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { AddHabitForm } from "./AddHabitForm";

export default async function HomePage() {
  const { user } = await getCurrentMembership();

  const [data, profile, challenges, leaderboard, events, posts] = await Promise.all([
    getDailyOS(),
    getOwnProfile(),
    getChallenges(),
    getLeaderboard(),
    getEvents(),
    getFeed(),
  ]);

  if (!data) {
    return null;
  }

  const { habits, streak, completedTodayCount } = data;
  const trend = habits.length > 0 ? await getCompletionTrend(14) : null;
  const week = trend ? trend.slice(-7) : [];

  const totalXp = profile?.totalXp ?? 0;
  const level = profile?.level ?? 0;
  const progress = progressToNextLevel(totalXp);
  const todayRate =
    habits.length > 0 ? Math.round((completedTodayCount / habits.length) * 100) : 0;

  const completedChallenges = (challenges ?? []).filter((c) => c.isCompleted).length;
  const rankIndex = leaderboard?.findIndex((e) => e.userId === user?.id) ?? -1;
  const rank = rankIndex >= 0 ? rankIndex + 1 : null;

  const firstName = profile?.displayName?.split(" ")[0] ?? "Member";
  const heroLine =
    streak > 0
      ? `${streak}-day streak. Keep going.`
      : "Start your streak today.";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-stone">{formatToday()}</p>
        <h1 className="font-display text-4xl text-paper sm:text-5xl">
          Welcome back, {firstName}.
        </h1>
        <p className="text-sm text-stone">{heroLine}</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
        <Reveal>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">Streak</p>
            <p className="mt-2 font-display text-3xl text-gold">
              <AnimatedNumber value={streak} />
            </p>
            {week.length > 0 && (
              <div className="mt-3">
                <StreakDots days={week} />
              </div>
            )}
          </Card>
        </Reveal>
        <Reveal delay={0.03}>
          <Card className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-wider text-stone">Today</p>
            {habits.length > 0 ? (
              <CompletionRing completed={completedTodayCount} total={habits.length} />
            ) : (
              <p className="font-display text-2xl text-paper">0/0</p>
            )}
          </Card>
        </Reveal>
        <Reveal delay={0.06}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">Total XP</p>
            <p className="mt-2 font-display text-3xl text-paper">
              <AnimatedNumber value={totalXp} />
            </p>
          </Card>
        </Reveal>
        <Reveal delay={0.09}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">Level</p>
            <p className="mt-2 font-display text-3xl text-gold">
              <AnimatedNumber value={level} />
            </p>
          </Card>
        </Reveal>
        <Reveal delay={0.12}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">Challenges</p>
            <p className="mt-2 font-display text-3xl text-paper">
              <AnimatedNumber value={completedChallenges} />
            </p>
            <p className="mt-1 text-xs text-stone">completed</p>
          </Card>
        </Reveal>
        <Reveal delay={0.15}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">Rank</p>
            <p className="mt-2 font-display text-3xl text-paper">
              {rank ? <>#<AnimatedNumber value={rank} /></> : "—"}
            </p>
            {leaderboard && leaderboard.length > 0 && (
              <p className="mt-1 text-xs text-stone">of {leaderboard.length}</p>
            )}
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {trend && (
            <Reveal delay={0.1}>
              <Card>
                <p className="text-xs uppercase tracking-wider text-stone">
                  Habit progress — last 14 days
                </p>
                <div className="mt-3">
                  <CompletionTrendChart points={trend} />
                </div>
              </Card>
            </Reveal>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            {week.length > 0 && (
              <Reveal delay={0.14}>
                <Card>
                  <p className="text-xs uppercase tracking-wider text-stone">
                    Weekly consistency
                  </p>
                  <div className="mt-3">
                    <WeeklyConsistencyChart days={week} />
                  </div>
                </Card>
              </Reveal>
            )}
            <Reveal delay={0.18}>
              <Card>
                <p className="text-xs uppercase tracking-wider text-stone">
                  Recent milestones
                </p>
                <div className="mt-3">
                  <MilestonesList challenges={challenges ?? []} />
                </div>
              </Card>
            </Reveal>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
              Today&apos;s habits
            </h2>
            {habits.length === 0 ? (
              <Card>
                <p className="text-sm text-stone">
                  You haven&apos;t added any habits yet. Add your first one below.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {habits.map((habit, index) => (
                  <Reveal key={habit.id} delay={index * 0.03}>
                    <HabitRow habit={habit} />
                  </Reveal>
                ))}
              </div>
            )}
            <AddHabitForm />
          </div>
        </div>

        <div className="space-y-6">
          <Reveal delay={0.08}>
            <Card>
              <p className="text-xs uppercase tracking-wider text-stone">
                Progress overview
              </p>
              <div className="mt-3">
                <ProgressOverview progress={progress} streak={streak} todayRate={todayRate} />
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.16}>
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider text-stone">Leaderboard</p>
              </div>
              <div className="mt-3">
                <LeaderboardPreview
                  entries={leaderboard ?? []}
                  currentUserId={user?.id ?? null}
                />
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.2}>
            <Card>
              <p className="text-xs uppercase tracking-wider text-stone">
                Upcoming events
              </p>
              <div className="mt-3">
                <UpcomingEventsPreview events={events ?? []} />
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.24}>
            <Card>
              <p className="text-xs uppercase tracking-wider text-stone">
                Community feed
              </p>
              <div className="mt-3">
                <CommunityFeedPreview posts={posts ?? []} />
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function formatToday(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
