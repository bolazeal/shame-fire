'use client';

import { LeftSidebar } from '@/components/main-layout/left-sidebar';
import { RightSidebar } from '@/components/main-layout/right-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { MobileBottomNav } from '@/components/main-layout/mobile-bottom-nav';
import { NotificationProvider } from '@/context/notification-context';
import { isFirebaseConfigured } from '@/lib/firebase';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if Firebase is configured. Otherwise, we stay in mock mode.
    if (!loading && !user && isFirebaseConfigured) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const isAdminPage = pathname.startsWith('/admin');

  // Show skeleton if we're loading OR if we're not in mock mode and there's no user yet.
  if (loading || (!user && isFirebaseConfigured)) {
    return (
      <div className="container mx-auto flex min-h-screen">
        {!isAdminPage && (
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
        )}
        <main className="flex-1 border-x border-border">
          <ScrollArea className="h-screen">
            <div className="border-b p-4">
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="p-4">
                <Skeleton className="h-96 w-full" />
            </div>
          </ScrollArea>
        </main>
        {!isAdminPage && (
          <aside className="sticky top-0 hidden h-screen w-80 flex-col gap-4 p-4 lg:flex">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
          </aside>
        )}
      </div>
    );
  }

  // If we reach here, we're either logged in OR in mock mode.
  return (
    <NotificationProvider>
      <div className="container mx-auto flex min-h-screen">
        {!isAdminPage && <LeftSidebar />}
        <main className="flex-1 border-x-0 md:border-x border-border pb-16 lg:pb-0">
          <ScrollArea className="h-screen">
            {children}
          </ScrollArea>
        </main>
        {!isAdminPage && <RightSidebar />}
      </div>
      {!isAdminPage && <MobileBottomNav />}
    </NotificationProvider>
  );
}
