'use client';

import { ClarityLogo } from '@/components/shame-logo';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/home');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="mb-8">
          <ClarityLogo />
        </div>
        <div className="w-full max-w-sm space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <ClarityLogo />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
