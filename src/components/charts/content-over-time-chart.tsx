
'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

const chartConfig = {
  posts: {
    label: 'Posts',
    color: 'hsl(var(--chart-1))',
  },
  reports: {
    label: 'Reports',
    color: 'hsl(var(--chart-2))',
  },
  endorsements: {
    label: 'Endorsements',
    color: 'hsl(var(--chart-3))',
  },
};

interface ContentOverTimeChartProps {
  data: {
    date: string;
    posts: number;
    reports: number;
    endorsements: number;
  }[];
}

export function ContentOverTimeChart({ data }: ContentOverTimeChartProps) {
  return (
    <div className="h-80 w-full">
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <LineChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            allowDecimals={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            dataKey="posts"
            type="monotone"
            stroke="var(--color-posts)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="reports"
            type="monotone"
            stroke="var(--color-reports)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="endorsements"
            type="monotone"
            stroke="var(--color-endorsements)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
