"use client";

import { LineChart } from "@/components/charts/line-chart";
import { Line } from "@/components/charts/line";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import type { CompletionTrendPoint } from "@/lib/habits";

export function CompletionTrendChart({
  points,
}: {
  points: CompletionTrendPoint[];
}) {
  const data = points.map((p) => ({
    date: new Date(`${p.date}T00:00:00Z`),
    rate: p.rate,
  }));

  return (
    <LineChart
      data={data}
      xDataKey="date"
      aspectRatio="3 / 1"
      margin={{ top: 20, right: 12, bottom: 28, left: 12 }}
    >
      <Grid horizontal strokeDasharray="2,4" />
      <Line dataKey="rate" strokeWidth={2} />
      <XAxis />
      <ChartTooltip
        rows={(point) => [
          {
            label: "Completion",
            value: `${point.rate as number}%`,
            color: "var(--chart-line-primary)",
          },
        ]}
      />
    </LineChart>
  );
}
