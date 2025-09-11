
'use client';

import { DisputeCard } from '@/components/dispute-card';
import { Landmark, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { getAllDisputes } from '@/lib/firestore';
import type { Dispute } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

function DisputeSkeleton() {
  return (
    <div className="border-b p-4">
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-12 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function VillageSquarePage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisputes = async () => {
      setLoading(true);
      try {
        const fetchedDisputes = await getAllDisputes();
        setDisputes(fetchedDisputes);
      } catch (error) {
        console.error('Failed to fetch disputes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDisputes();
  }, []);

  const activeDisputes = useMemo(
    () => disputes.filter((d) => d.status !== 'closed'),
    [disputes]
  );
  const closedDisputes = useMemo(
    () => disputes.filter((d) => d.status === 'closed'),
    [disputes]
  );

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
          {loading ? (
            <>
              <DisputeSkeleton />
              <DisputeSkeleton />
            </>
          ) : activeDisputes.length === 0 ? (
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
          {loading ? (
            <>
              <DisputeSkeleton />
              <DisputeSkeleton />
            </>
          ) : closedDisputes.length === 0 ? (
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
