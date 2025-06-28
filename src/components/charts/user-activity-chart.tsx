
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { userActivity } from '@/lib/mock-data';

const chartConfig = {
  signups: {
    label: 'Signups',
    color: 'hsl(var(--chart-1))',
  },
};

export function UserActivityChart() {
  return (
    <div className="h-64 w-full">
      <ChartContainer config={chartConfig}>
        <BarChart accessibilityLayer data={userActivity}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
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
