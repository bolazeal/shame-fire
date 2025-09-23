'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartConfig = {
  signups: {
    label: 'Signups',
    color: 'hsl(var(--chart-1))',
  },
};

interface UserActivityChartProps {
    data: {
        date: string;
        signups: number;
    }[];
}

export function UserActivityChart({ data }: UserActivityChartProps) {
  return (
    <div className="h-64 w-full lg:h-80">
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={data}>
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
          <Bar dataKey="signups" fill="var(--color-signups)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
