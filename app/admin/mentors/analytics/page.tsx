import { getMentorAnalyticsSummary, getMentorSessionsTrend } from "@/lib/mentor-analytics";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { MentorSessionsChart } from "@/components/admin/MentorSessionsChart";

export default async function AdminMentorAnalyticsPage() {
  const [summary, trend] = await Promise.all([
    getMentorAnalyticsSummary(),
    getMentorSessionsTrend(30),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-paper">Mentor Analytics</h1>
        <p className="mt-1 text-sm text-stone">
          How the mentor marketplace is actually performing.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Reveal>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              Sessions completed
            </p>
            <p className="mt-2 font-display text-3xl text-gold">
              <AnimatedNumber value={summary.sessionsCompleted} />
            </p>
          </Card>
        </Reveal>
        <Reveal delay={0.03}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              Member reach
            </p>
            <p className="mt-2 font-display text-3xl text-paper">
              <AnimatedNumber value={summary.memberReach} />
            </p>
          </Card>
        </Reveal>
        <Reveal delay={0.06}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              Completion rate
            </p>
            <p className="mt-2 font-display text-3xl text-paper">
              <AnimatedNumber value={summary.completionRate} />%
            </p>
            <p className="mt-1 text-xs text-stone">
              {summary.sessionsCompleted}/{summary.totalRequests} requests
            </p>
          </Card>
        </Reveal>
        <Reveal delay={0.09}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              Avg response time
            </p>
            <p className="mt-2 font-display text-3xl text-paper">
              {summary.avgResponseHours !== null
                ? `${Math.round(summary.avgResponseHours)}h`
                : "—"}
            </p>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.12}>
        <Card>
          <p className="text-xs uppercase tracking-wider text-stone">
            Sessions completed — last 30 days
          </p>
          <div className="mt-3">
            <MentorSessionsChart points={trend} />
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
