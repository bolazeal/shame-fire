import { LeftSidebar } from '@/components/main-layout/left-sidebar';
import { RightSidebar } from '@/components/main-layout/right-sidebar';
import { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto flex min-h-screen">
      <LeftSidebar />
      <main className="flex-1 border-x border-border">{children}</main>
      <RightSidebar />
    </div>
  );
}
