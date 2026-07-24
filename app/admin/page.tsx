import { getAllMembers } from "@/lib/admin";
import {
  getMembershipBreakdown,
  getMemberGrowthByWeek,
  getXpTrend,
} from "@/lib/analytics";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { MemberGrowthChart } from "@/components/admin/MemberGrowthChart";
import { XpTrendChart } from "@/components/admin/XpTrendChart";

export default async function AdminOverviewPage() {
  const members = await getAllMembers();
  const breakdown = getMembershipBreakdown(members);
  const weeklySignups = getMemberGrowthByWeek(members, 8);
  const xpTrend = await getXpTrend(14);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-paper">Overview</h1>
        <p className="mt-1 text-sm text-stone">
          Membership and engagement at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Reveal>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              Members
            </p>
            <p className="mt-2 font-display text-3xl text-paper">
              <AnimatedNumber value={breakdown.total} />
            </p>
          </Card>
        </Reveal>
        <Reveal delay={0.04}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              Active
            </p>
            <p className="mt-2 font-display text-3xl text-gold">
              <AnimatedNumber value={breakdown.active} />
            </p>
          </Card>
        </Reveal>
        <Reveal delay={0.08}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              Pending
            </p>
            <p className="mt-2 font-display text-3xl text-paper">
              <AnimatedNumber value={breakdown.pending} />
            </p>
          </Card>
        </Reveal>
        <Reveal delay={0.12}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              Suspended / Revoked
            </p>
            <p className="mt-2 font-display text-3xl text-paper">
              <AnimatedNumber value={breakdown.suspended + breakdown.revoked} />
            </p>
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal delay={0.16}>
          <Card>
            <p className="text-xs uppercase tracking-wider text-stone">
              New members — last 8 weeks
            </p>
            <div className="mt-3">
              <MemberGrowthChart weeks={weeklySignups} />
            </div>
          </Card>
        </Reveal>
        <Reveal delay={0.2}>
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
    </div>
  );
}
