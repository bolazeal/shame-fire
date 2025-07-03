
'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { mockPosts } from '@/lib/mock-data';
import { Label, Pie, PieChart } from 'recharts';

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

export function ContentBreakdownChart() {
  const totalPosts = mockPosts.length;
  const chartData = Object.keys(chartConfig).map((key) => {
    const type = key.slice(0, -1);
    return {
      type: key,
      count: mockPosts.filter((p) => p.type === type).length,
      fill: `var(--color-${key})`,
    };
  });

  return (
    <div className="h-64 w-full">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square h-full"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="type"
            innerRadius="60%"
            strokeWidth={5}
            labelLine={false}
            label={(props: any) => {
              const { value, cx, cy, x, y, textAnchor, dominantBaseline } =
                props;
              if (value === undefined || totalPosts === 0) return null;
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  dominantBaseline={dominantBaseline}
                  fill="hsl(var(--foreground))"
                >
                  {`${((value / totalPosts) * 100).toFixed(0)}%`}
                </text>
              );
            }}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-bold"
                      >
                        {totalPosts.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground"
                      >
                        Total Content
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </Pie>
          <ChartLegend
            content={<ChartLegendContent nameKey="type" />}
            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
