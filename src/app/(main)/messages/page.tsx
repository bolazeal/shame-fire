import { Mail } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6" />
          <h1 className="text-xl font-bold font-headline">Messages</h1>
        </div>
      </header>
      <div className="flex h-[calc(100vh-120px)] items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Coming Soon!</h2>
          <p className="text-muted-foreground">
            This feature is currently under construction.
          </p>
        </div>
      </div>
    </div>
  );
}
