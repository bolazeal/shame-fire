'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { LeftSidebar } from '@/components/main-layout/left-sidebar';
import { RightSidebar } from '@/components/main-layout/right-sidebar';
import { MobileBottomNav } from '@/components/main-layout/mobile-bottom-nav';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export function AppBody({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password');
  const isAdminPage = pathname.startsWith('/admin');

  // Show a loading skeleton or nothing for auth pages while we check the user's status
  if ((loading || user) && isAuthPage) {
    return null;
  }
  
  // Render the main app layout if not an auth or admin page
  if (!isAuthPage && !isAdminPage) {
    return (
      <>
        <div className="container mx-auto flex min-h-screen max-w-7xl">
          <LeftSidebar />
          <main className="flex-1 border-x border-border">
            <div className="min-h-screen pb-16 lg:pb-0">
              {children}
            </div>
          </main>
          <RightSidebar />
        </div>
        <MobileBottomNav />
        <Toaster />
      </>
    );
  }

  // Render children directly for Auth and Admin pages, which have their own layouts.
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
