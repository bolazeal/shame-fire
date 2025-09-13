
'use client';

import { Home, Search, PenSquare, Bell, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CreatePostDialog } from '../create-post-dialog';
import { Button } from '../ui/button';
import { useNotification } from '@/hooks/use-notification';
import { Badge } from '../ui/badge';
import { MobileMoreSheet } from './mobile-more-sheet';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotification();

  const getLinkClass = (href: string) => {
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
              'relative flex-1 p-2 text-muted-foreground transition-colors hover:text-primary',
              getLinkClass('/notifications') && 'text-primary'
            )}
          >
            <Bell className="mx-auto h-7 w-7" />
            {unreadCount > 0 && (
                <Badge className="absolute right-3 top-2 h-5 w-5 justify-center rounded-full p-0 text-xs">
                    {unreadCount}
                </Badge>
            )}
          </Link>
          <div className="flex-1 p-2 text-center text-muted-foreground transition-colors hover:text-primary">
            <MobileMoreSheet>
              <button className="flex w-full justify-center">
                <MoreHorizontal className="h-7 w-7" />
              </button>
            </MobileMoreSheet>
          </div>
        </nav>
      </div>
    </footer>
  );
}
