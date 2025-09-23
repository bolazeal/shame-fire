
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import { LeftSidebar } from '@/components/main-layout/left-sidebar';
import { RightSidebar } from '@/components/main-layout/right-sidebar';
import { MobileBottomNav } from '@/components/main-layout/mobile-bottom-nav';
import { NotificationProvider } from '@/context/notification-context';
import { usePathname } from 'next/navigation';

// Note: Metadata export is commented out because this is now a client component.
// In a real app, you might move this to a server component wrapper if needed.
// export const metadata: Metadata = {
//   title: 'Shame',
//   description: 'A platform for transparent feedback and accountability.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn('min-h-screen bg-background font-body antialiased')}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NotificationProvider>
              {isAdminPage ? (
                <div className="h-screen overflow-y-auto">{children}</div>
              ) : (
                <>
                  <div className="container mx-auto flex min-h-screen max-w-7xl">
                    <LeftSidebar />
                    <main className="flex-1 border-x border-border">
                        <div className="lg:pb-0 pb-16 h-screen overflow-y-auto">{children}</div>
                    </main>
                    <RightSidebar />
                  </div>
                  <MobileBottomNav />
                </>
              )}
              <Toaster />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
