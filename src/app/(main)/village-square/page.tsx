import { DisputeCard } from '@/components/dispute-card';
import { mockDisputes } from '@/lib/mock-data';
import { Landmark } from 'lucide-react';

export default function VillageSquarePage() {
  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <Landmark className="h-6 w-6" />
        <h1 className="text-xl font-bold font-headline">Village Square</h1>
      </header>

      <section className="flex flex-col">
        {mockDisputes.length === 0 ? (
          <p className="p-4 text-center text-muted-foreground">
            The Village Square is currently empty.
          </p>
        ) : (
          mockDisputes.map((dispute) => (
            <DisputeCard key={dispute.id} dispute={dispute} />
          ))
        )}
      </section>
    </div>
  );
}
