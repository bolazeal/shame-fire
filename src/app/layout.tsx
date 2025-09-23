import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import { NotificationProvider } from '@/context/notification-context';
import { AppBody } from '@/components/app-body';

export const metadata: Metadata = {
  title: 'Shame',
  description: 'A platform for transparent feedback and accountability.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              <AppBody>{children}</AppBody>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
