'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
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

interface ContentBreakdownChartProps {
    data: {
        type: string;
        count: number;
    }[];
}

export function ContentBreakdownChart({ data }: ContentBreakdownChartProps) {
  const totalContent = data.reduce((acc, item) => acc + item.count, 0);

  const chartData = data.map(item => ({
      ...item,
      fill: `var(--color-${item.type})`
  }));

  return (
    <div className="h-64 w-full lg:h-80">
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
              const { payload, value, cx, cy, x, y, textAnchor, dominantBaseline } =
                props;
              if (value === undefined || totalContent === 0) return null;
              if (value === 0) return null; // Don't show label for 0%
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  dominantBaseline={dominantBaseline}
                  fill="hsl(var(--foreground))"
                  className="text-xs"
                >
                  {`${((value / totalContent) * 100).toFixed(0)}%`}
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
                        {totalContent.toLocaleString()}
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
