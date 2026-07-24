import { getAllMembers, getAccessCodes } from "@/lib/admin";
import {
  getMembershipBreakdown,
  getMemberGrowthByWeek,
  getXpTrend,
  getActiveMembersThisWeek,
  getChallengeCompletionRate,
  getRecentActivity,
  getAccessCodeSummary,
} from "@/lib/analytics";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { MemberGrowthChart } from "@/components/admin/MemberGrowthChart";
import { XpTrendChart } from "@/components/admin/XpTrendChart";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { AccessCodesSummary } from "@/components/admin/AccessCodesSummary";

export default async function AdminOverviewPage() {
  const [members, accessCodes, activeThisWeek, completionRate, recentActivity] =
    await Promise.all([
      getAllMembers(),
      getAccessCodes(),
      getActiveMembersThisWeek(7),
      getChallengeCompletionRate(),
      getRecentActivity(6),
    ]);

  const breakdown = getMembershipBreakdown(members);
  const weeklySignups = getMemberGrowthByWeek(members, 8);
  const xpTrend = await getXpTrend(14);
  const accessCodeSummary = getAccessCodeSummary(accessCodes);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Overview</h1>
        <p className="mt-1 text-sm text-stone">
          Membership and engagement at a glance.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-6">
        <Reveal>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">Members</p>
            <p className="mt-2 font-display text-3xl text-paper">
              <AnimatedNumber value={breakdown.total} />
            </p>
          </Card>
        </Reveal>
        <Reveal delay={0.03}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">Active</p>
            <p className="mt-2 font-display text-3xl text-gold">
              <AnimatedNumber value={breakdown.active} />
            </p>
          </Card>
        </Reveal>
        <Reveal delay={0.06}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">Pending</p>
            <p className="mt-2 font-display text-3xl text-paper">
              <AnimatedNumber value={breakdown.pending} />
            </p>
          </Card>
        </Reveal>
        <Reveal delay={0.09}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              Suspended / Revoked
            </p>
            <p className="mt-2 font-display text-3xl text-paper">
              <AnimatedNumber value={breakdown.suspended + breakdown.revoked} />
            </p>
          </Card>
        </Reveal>
        <Reveal delay={0.12}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              Active this week
            </p>
            <p className="mt-2 font-display text-3xl text-gold">
              <AnimatedNumber value={activeThisWeek} />
            </p>
          </Card>
        </Reveal>
        <Reveal delay={0.15}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              Challenge completion
            </p>
            <p className="mt-2 font-display text-3xl text-paper">
              <AnimatedNumber value={completionRate.rate} />%
            </p>
            <p className="mt-1 text-xs text-stone">
              {completionRate.completed}/{completionRate.total} joined
            </p>
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal delay={0.1}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              New members — last 8 weeks
            </p>
            <div className="mt-3">
              <MemberGrowthChart weeks={weeklySignups} />
            </div>
          </Card>
        </Reveal>
        <Reveal delay={0.14}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              XP awarded — last 14 days
            </p>
            <div className="mt-3">
              <XpTrendChart points={xpTrend} />
            </div>
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal delay={0.18}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              Recent activity
            </p>
            <div className="mt-3">
              <RecentActivity entries={recentActivity} />
            </div>
          </Card>
        </Reveal>
        <Reveal delay={0.22}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              Access codes
            </p>
            <div className="mt-3">
              <AccessCodesSummary summary={accessCodeSummary} />
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
