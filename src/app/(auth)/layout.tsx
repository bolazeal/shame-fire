import { ClarityLogo } from '@/components/clarity-logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <ClarityLogo />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
