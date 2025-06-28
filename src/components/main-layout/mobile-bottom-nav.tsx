'use client';

import { Home, Search, PenSquare, Bell, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CreatePostDialog } from '../create-post-dialog';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/use-auth';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getLinkClass = (href: string) => {
    if (href.startsWith('/profile')) {
      return pathname.startsWith('/profile');
    }
    return pathname === href;
  };

  return (
    <footer className="fixed bottom-0 z-20 w-full border-t bg-background lg:hidden">
      <div className="container mx-auto max-w-md px-0">
        <nav className="flex h-16 items-center justify-around">
          <Link
            href="/home"
            className={cn(
              'flex-1 p-2 text-muted-foreground transition-colors hover:text-primary',
              getLinkClass('/home') && 'text-primary'
            )}
          >
            <Home className="mx-auto h-7 w-7" />
          </Link>
          <Link
            href="/search"
            className={cn(
              'flex-1 p-2 text-muted-foreground transition-colors hover:text-primary',
              getLinkClass('/search') && 'text-primary'
            )}
          >
            <Search className="mx-auto h-7 w-7" />
          </Link>
          <div className="flex-1 text-center">
            <CreatePostDialog
              trigger={
                <Button
                  variant="default"
                  size="icon"
                  className="h-12 w-12 rounded-full shadow-lg"
                >
                  <PenSquare className="h-6 w-6" />
                </Button>
              }
            />
          </div>
          <Link
            href="/notifications"
            className={cn(
              'flex-1 p-2 text-muted-foreground transition-colors hover:text-primary',
              getLinkClass('/notifications') && 'text-primary'
            )}
          >
            <Bell className="mx-auto h-7 w-7" />
          </Link>
          <Link
            href={`/profile/${user?.uid || 'user1'}`}
            className={cn(
              'flex-1 p-2 text-muted-foreground transition-colors hover:text-primary',
              getLinkClass(`/profile/${user?.uid || 'user1'}`) && 'text-primary'
            )}
          >
            <User className="mx-auto h-7 w-7" />
          </Link>
        </nav>
      </div>
    </footer>
  );
}
