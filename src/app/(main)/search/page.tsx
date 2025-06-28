import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SearchPage() {
  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 p-2 backdrop-blur-sm sm:p-4">
        <div className="relative mx-auto max-w-xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search Shame..."
            className="w-full rounded-full bg-muted pl-10"
          />
        </div>
      </header>
      <div className="flex h-[calc(100vh-200px)] items-center justify-center p-4 lg:h-[calc(100vh-120px)]">
        <div className="text-center">
          <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-bold">Find anything</h2>
          <p className="text-muted-foreground">
            Search for posts, users, and disputes across the platform.
          </p>
        </div>
      </div>
    </div>
  );
}
