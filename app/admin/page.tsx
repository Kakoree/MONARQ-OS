import Link from "next/link";
import { getAllMembers, getAccessCodes } from "@/lib/admin";
import {
  getMembershipBreakdown,
  getMemberGrowthByWeek,
  getXpTrend,
  getActiveMembersThisWeek,
  getChallengeCompletionRate,
  getRecentActivity,
  getAccessCodeSummary,
  getConnectionStats,
} from "@/lib/analytics";
import { getRetentionInsights } from "@/lib/insights";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { MemberGrowthChart } from "@/components/admin/MemberGrowthChart";
import { XpTrendChart } from "@/components/admin/XpTrendChart";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { AccessCodesSummary } from "@/components/admin/AccessCodesSummary";

const QUICK_LINKS = [
  { label: "Run a season", href: "/admin/seasons" },
  { label: "Approve a mentor", href: "/admin/mentors" },
  { label: "Configure a drop", href: "/admin/drops" },
  { label: "Review reports", href: "/admin/moderation" },
];

export default async function AdminOverviewPage() {
  const [members, accessCodes, activeThisWeek, completionRate, recentActivity, connectionStats] =
    await Promise.all([
      getAllMembers(),
      getAccessCodes(),
      getActiveMembersThisWeek(7),
      getChallengeCompletionRate(),
      getRecentActivity(6),
      getConnectionStats(),
    ]);

  const breakdown = getMembershipBreakdown(members);
  const weeklySignups = getMemberGrowthByWeek(members, 8);
  const xpTrend = await getXpTrend(14);
  const accessCodeSummary = getAccessCodeSummary(accessCodes);
  const retention = await getRetentionInsights(breakdown.active, activeThisWeek);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-paper">Overview</h1>
          <p className="mt-1 text-sm text-stone">
            Membership and engagement at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-stone transition-colors hover:text-gold"
            >
              {link.label} →
            </Link>
          ))}
        </div>
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
        <Reveal delay={0.18}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              Connections
            </p>
            <p className="mt-2 font-display text-3xl text-gold">
              <AnimatedNumber value={connectionStats.accepted} />
            </p>
            <p className="mt-1 text-xs text-stone">
              {connectionStats.pending} pending
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

      <div className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stone">
          Retention &amp; Engagement
        </h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Reveal>
            <Card>
              <p className="text-xs uppercase tracking-wider text-stone">
                Churn risk
              </p>
              <p className="mt-2 font-display text-3xl text-danger">
                <AnimatedNumber value={retention.churnRiskCount} />
              </p>
              <p className="mt-1 text-xs text-stone">
                active, no activity this week
              </p>
            </Card>
          </Reveal>
          <Reveal delay={0.03}>
            <Card>
              <p className="text-xs uppercase tracking-wider text-stone">
                Season participation
              </p>
              <p className="mt-2 font-display text-3xl text-paper">
                {retention.seasonParticipationRate !== null
                  ? `${retention.seasonParticipationRate}%`
                  : "—"}
              </p>
              <p className="mt-1 text-xs text-stone">
                {retention.seasonParticipationRate === null && "no active season"}
              </p>
            </Card>
          </Reveal>
          <Reveal delay={0.06}>
            <Card>
              <p className="text-xs uppercase tracking-wider text-stone">
                Teachings engagement
              </p>
              <p className="mt-2 font-display text-3xl text-paper">
                <AnimatedNumber value={retention.teachingsCompletionRate} />%
              </p>
              <p className="mt-1 text-xs text-stone">of active members</p>
            </Card>
          </Reveal>
          <Reveal delay={0.09}>
            <Card>
              <p className="text-xs uppercase tracking-wider text-stone">
                Drops claimed
              </p>
              <p className="mt-2 font-display text-3xl text-gold">
                <AnimatedNumber value={retention.dropsClaimedCount} />
              </p>
              <p className="mt-1 text-xs text-stone">
                by {retention.membersWithDropsCount} members
              </p>
            </Card>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
