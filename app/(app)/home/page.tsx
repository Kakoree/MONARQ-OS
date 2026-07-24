import { getDailyOS, getCompletionTrend } from "@/lib/habits";
import { Card } from "@/components/ui/Card";
import { HabitRow } from "@/components/home/HabitRow";
import { CompletionRing } from "@/components/home/CompletionRing";
import { CompletionTrendChart } from "@/components/home/CompletionTrendChart";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { AddHabitForm } from "./AddHabitForm";

export default async function HomePage() {
  const data = await getDailyOS();

  if (!data) {
    return null;
  }

  const { habits, streak, completedTodayCount } = data;
  const trend = habits.length > 0 ? await getCompletionTrend(14) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Home</h1>
        <p className="mt-1 text-sm text-stone">{formatToday()}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Reveal>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              Streak
            </p>
            <p className="mt-2 font-display text-4xl text-gold">
              <AnimatedNumber value={streak} /> {streak === 1 ? "day" : "days"}
            </p>
          </Card>
        </Reveal>
        <Reveal delay={0.05}>
          <Card className="flex items-center justify-between gap-4">
            <p className="text-xs uppercase tracking-wider text-stone">
              Today
            </p>
            {habits.length > 0 ? (
              <CompletionRing completed={completedTodayCount} total={habits.length} />
            ) : (
              <p className="font-display text-4xl text-paper">0/0</p>
            )}
          </Card>
        </Reveal>
      </div>

      {trend && (
        <Reveal delay={0.1}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              Last 14 days
            </p>
            <div className="mt-3">
              <CompletionTrendChart points={trend} />
            </div>
          </Card>
        </Reveal>
      )}

      <div className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
          Today&apos;s habits
        </h2>
        {habits.length === 0 ? (
          <Card>
            <p className="text-sm text-stone">
              You haven&apos;t added any habits yet. Add your first one
              below.
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
  );
}

function formatToday(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
