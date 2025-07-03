'use client';

import { DisputeCard } from '@/components/dispute-card';
import { Landmark, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAllDisputes } from '@/lib/firestore';
import type { Dispute } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

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

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <Landmark className="h-6 w-6" />
        <h1 className="text-xl font-bold font-headline">Village Square</h1>
      </header>

      <section className="flex flex-col">
        {loading ? (
          <>
            <DisputeSkeleton />
            <DisputeSkeleton />
          </>
        ) : disputes.length === 0 ? (
          <p className="p-4 text-center text-muted-foreground">
            The Village Square is currently empty.
          </p>
        ) : (
          disputes.map((dispute) => (
            <DisputeCard key={dispute.id} dispute={dispute} />
          ))
        )}
      </section>
    </div>
  );
}
