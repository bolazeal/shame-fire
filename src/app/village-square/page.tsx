import { DisputeCard } from '@/components/dispute-card';
import { Landmark, Loader2 } from 'lucide-react';
import { getAllDisputes } from '@/lib/firestore';
import type { Dispute } from '@/lib/types';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default async function VillageSquarePage() {
  const disputes = await getAllDisputes();

  const activeDisputes = disputes.filter((d) => d.status !== 'closed');
  const closedDisputes = disputes.filter((d) => d.status === 'closed');

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <Landmark className="h-6 w-6" />
        <h1 className="text-xl font-bold font-headline">Village Square</h1>
      </header>

      <Tabs defaultValue="active" className="w-full">
        <div className="border-b px-4">
          <TabsList className="grid w-full grid-cols-2 bg-transparent p-0">
            <TabsTrigger
              value="active"
              className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Active ({activeDisputes.length})
            </TabsTrigger>
            <TabsTrigger
              value="closed"
              className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Closed ({closedDisputes.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active">
          {activeDisputes.length === 0 ? (
            <p className="p-4 text-center text-muted-foreground">
              No active disputes right now.
            </p>
          ) : (
            activeDisputes.map((dispute) => (
              <DisputeCard key={dispute.id} dispute={dispute} />
            ))
          )}
        </TabsContent>
        <TabsContent value="closed">
          {closedDisputes.length === 0 ? (
            <p className="p-4 text-center text-muted-foreground">
              No closed disputes yet.
            </p>
          ) : (
            closedDisputes.map((dispute) => (
              <DisputeCard key={dispute.id} dispute={dispute} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
