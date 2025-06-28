import { DisputeCard } from '@/components/dispute-card';
import { mockDisputes } from '@/lib/mock-data';
import { Separator } from '@/components/ui/separator';

export default function VillageSquarePage() {
  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <h1 className="text-xl font-bold font-headline">Village Square</h1>
      </header>

      <section className="flex flex-col">
        {mockDisputes.map((dispute, index) => (
          <DisputeCard key={dispute.id} dispute={dispute} />
        ))}
        {mockDisputes.length === 0 && (
          <p className="p-4 text-center text-muted-foreground">
            No active disputes in the Village Square.
          </p>
        )}
      </section>
    </div>
  );
}
