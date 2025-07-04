
'use client';

import { LeftSidebar } from '@/components/main-layout/left-sidebar';
import { RightSidebar } from '@/components/main-layout/right-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { ModerationProvider } from '@/context/moderation-context';
import { MobileBottomNav } from '@/components/main-layout/mobile-bottom-nav';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="container mx-auto flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 flex-col justify-between p-2 lg:flex">
          <div className="space-y-4 p-4">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
            <Skeleton className="h-14 w-full" />
          </div>
          <div className="p-4">
            <Skeleton className="h-12 w-full" />
          </div>
        </aside>
        <main className="flex-1 border-x border-border">
          <div className="border-b p-4">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="p-4">
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <aside className="sticky top-0 hidden h-screen w-80 flex-col gap-4 p-4 lg:flex">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </aside>
      </div>
    );
  }

  return (
    <ModerationProvider>
      <div className="container mx-auto flex min-h-screen">
        <LeftSidebar />
        <main className="flex-1 border-x border-border pb-16 lg:pb-0">{children}</main>
        <RightSidebar />
      </div>
      <MobileBottomNav />
    </ModerationProvider>
  );
}
