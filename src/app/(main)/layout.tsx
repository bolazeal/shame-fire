'use client';

import { LeftSidebar } from '@/components/main-layout/left-sidebar';
import { RightSidebar } from '@/components/main-layout/right-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { MobileBottomNav } from '@/components/main-layout/mobile-bottom-nav';
import { NotificationProvider } from '@/context/notification-context';
import { isFirebaseConfigured } from '@/lib/firebase';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if Firebase is configured. Otherwise, we stay in mock mode.
    if (!loading && !user && isFirebaseConfigured) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show skeleton if we're loading OR if we're not in mock mode and there's no user yet.
  if (loading || (!user && isFirebaseConfigured)) {
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

  // If we reach here, we're either logged in OR in mock mode.
  return (
    <NotificationProvider>
      <div className="container mx-auto flex min-h-screen">
        <LeftSidebar />
        <main className="flex-1 border-x border-border pb-16 lg:pb-0">
          {!isFirebaseConfigured && (
            <Alert className="m-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Developer Mode Active</AlertTitle>
              <AlertDescription>
                This app is in mock mode because Firebase environment variables are missing. To enable user sign-up and connect to a live database, please add them to your deployment environment.
              </AlertDescription>
            </Alert>
          )}
          {children}
        </main>
        <RightSidebar />
      </div>
      <MobileBottomNav />
    </NotificationProvider>
  );
}
