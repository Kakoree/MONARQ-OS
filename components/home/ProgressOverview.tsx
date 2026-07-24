"use client";

import { RingChart } from "@/components/charts/ring-chart";
import { Ring } from "@/components/charts/ring";
import { RingCenter } from "@/components/charts/ring-center";
import type { LevelProgress } from "@/lib/progression";

export function ProgressOverview({
  progress,
  streak,
  todayRate,
}: {
  progress: LevelProgress;
  streak: number;
  todayRate: number;
}) {
  const percent = Math.round(progress.progressRatio * 100);
  const xpRemaining = progress.xpForThisLevel - progress.xpIntoLevel;

  return (
    <div className="flex items-center gap-6">
      <RingChart
        data={[
          { label: "Level progress", value: percent, maxValue: 100, color: "var(--gold)" },
        ]}
        size={128}
        strokeWidth={9}
      >
        <Ring index={0} />
        <RingCenter
          defaultLabel={`Level ${progress.level}`}
          suffix="%"
          valueClassName="font-display text-gold leading-none text-[clamp(1.2rem,26cqw,2.5rem)]"
          labelClassName="text-stone uppercase tracking-wider leading-tight text-[clamp(0.55rem,8cqw,0.7rem)]"
        />
      </RingChart>
      <dl className="flex-1 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-stone">XP to next level</dt>
          <dd className="text-paper">{xpRemaining}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-stone">Today</dt>
          <dd className="text-paper">{todayRate}%</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-stone">Streak</dt>
          <dd className="text-gold">
            {streak} {streak === 1 ? "day" : "days"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
