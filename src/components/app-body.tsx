'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { LeftSidebar } from '@/components/main-layout/left-sidebar';
import { RightSidebar } from '@/components/main-layout/right-sidebar';
import { MobileBottomNav } from '@/components/main-layout/mobile-bottom-nav';

export function AppBody({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <>
      {isAdminPage ? (
        <div className="h-screen overflow-y-auto">{children}</div>
      ) : (
        <>
          <div className="container mx-auto flex min-h-screen max-w-7xl">
            <LeftSidebar />
            <main className="flex-1 border-x border-border">
              <div className="h-screen overflow-y-auto pb-16 lg:pb-0">
                {children}
              </div>
            </main>
            <RightSidebar />
          </div>
          <MobileBottomNav />
        </>
      )}
      <Toaster />
    </>
  );
}
