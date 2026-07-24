"use client";

import { BarChart } from "@/components/charts/bar-chart";
import { Bar } from "@/components/charts/bar";
import { Grid } from "@/components/charts/grid";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import type { CompletionTrendPoint } from "@/lib/habits";

const WEEKDAY_FMT = new Intl.DateTimeFormat("en-US", { weekday: "short" });

export function WeeklyConsistencyChart({ days }: { days: CompletionTrendPoint[] }) {
  const data = days.map((d) => ({
    day: WEEKDAY_FMT.format(new Date(`${d.date}T00:00:00Z`)),
    rate: d.rate,
  }));

  return (
    <BarChart
      data={data}
      xDataKey="day"
      aspectRatio="2 / 1"
      margin={{ top: 20, right: 12, bottom: 28, left: 12 }}
    >
      <Grid horizontal strokeDasharray="2,4" />
      <Bar dataKey="rate" fill="var(--chart-line-primary)" lineCap="round" />
      <BarXAxis />
      <ChartTooltip
        rows={(point) => [
          {
            label: "Completion",
            value: `${point.rate as number}%`,
            color: "var(--chart-line-primary)",
          },
        ]}
      />
    </BarChart>
  );
}
