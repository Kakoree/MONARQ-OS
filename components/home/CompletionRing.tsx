"use client";

import { RingChart } from "@/components/charts/ring-chart";
import { Ring } from "@/components/charts/ring";
import { RingCenter } from "@/components/charts/ring-center";

export function CompletionRing({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  if (total === 0) return null;

  return (
    <RingChart
      data={[{ label: "Today", value: completed, maxValue: total, color: "var(--gold)" }]}
      size={104}
      strokeWidth={7}
    >
      <Ring index={0} />
      <RingCenter
        defaultLabel="complete"
        suffix={`/${total}`}
        valueClassName="font-display text-gold leading-none text-[clamp(1.1rem,26cqw,2.25rem)]"
        labelClassName="text-stone uppercase tracking-wider leading-tight text-[clamp(0.55rem,8cqw,0.7rem)]"
      />
    </RingChart>
  );
}
