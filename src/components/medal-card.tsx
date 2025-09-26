import type { MedalInfo } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface MedalCardProps {
  medal: MedalInfo;
}

export function MedalCard({ medal }: MedalCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-start gap-3">
          <medal.icon className="h-8 w-8 shrink-0 text-amber-500" />
          <span className="text-xl">{medal.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{medal.description}</p>
      </CardContent>
    </Card>
  );
}
