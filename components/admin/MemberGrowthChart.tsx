"use client";

import { BarChart } from "@/components/charts/bar-chart";
import { Bar } from "@/components/charts/bar";
import { Grid } from "@/components/charts/grid";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import type { WeeklySignups } from "@/lib/analytics";

const WEEK_LABEL_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

export function MemberGrowthChart({ weeks }: { weeks: WeeklySignups[] }) {
  const data = weeks.map((w) => ({
    week: WEEK_LABEL_FMT.format(new Date(`${w.weekStart}T00:00:00Z`)),
    count: w.count,
  }));

  return (
    <BarChart
      data={data}
      xDataKey="week"
      aspectRatio="3 / 1"
      margin={{ top: 20, right: 12, bottom: 28, left: 12 }}
    >
      <Grid horizontal strokeDasharray="2,4" />
      <Bar dataKey="count" fill="var(--chart-line-primary)" lineCap="round" />
      <BarXAxis />
      <ChartTooltip
        rows={(point) => [
          {
            label: "New members",
            value: point.count as number,
            color: "var(--chart-line-primary)",
          },
        ]}
      />
    </BarChart>
  );
}
