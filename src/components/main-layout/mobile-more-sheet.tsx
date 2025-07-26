'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Bell,
  Bookmark,
  Home,
  Landmark,
  LogOut,
  Mail,
  PenSquare,
  Shield,
  Trophy,
  User,
  Sun,
  Moon,
  Laptop,
  Tv,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from 'next-themes';
import { Separator } from '../ui/separator';
import { UserAvatar } from '../user-avatar';
import { useNotification } from '@/hooks/use-notification';
import { Badge } from '../ui/badge';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { href: '/profile', icon: User, text: 'Profile' },
  { href: '/home', icon: Home, text: 'Home' },
  { href: '/tv', icon: Tv, text: 'Shame or Shine TV' },
  { href: '/notifications', icon: Bell, text: 'Notifications' },
  { href: '/messages', icon: Mail, text: 'Messages' },
  { href: '/bookmarks', icon: Bookmark, text: 'Bookmarks' },
  { href: '/village-square', icon: Landmark, text: 'Village Square' },
  { href: '/hall-of-honour', icon: Trophy, text: 'Hall of Honour' },
  { href: '/admin', icon: Shield, text: 'Admin Panel' },
];

export function MobileMoreSheet({ children }: { children: React.ReactNode }) {
  const { user, logout, fullProfile } = useAuth();
  const { unreadCount } = useNotification();
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };
  
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg">
        <SheetHeader>
          <SheetTitle className="font-headline">More Options</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Link
            href={`/profile/${user?.uid || 'user1'}`}
            onClick={handleLinkClick}
            className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-accent/50"
          >
            {fullProfile && (
              <>
                <UserAvatar user={fullProfile} className="h-14 w-14" />
                <div>
                  <p className="text-lg font-bold">{fullProfile.name}</p>
                  <p className="text-muted-foreground">
                    @{fullProfile.username}
                  </p>
                </div>
              </>
            )}
          </Link>

          <Separator />

          <nav className="flex flex-col">
            {navItems.map((item) => {
              if (item.href === '/admin' && !fullProfile?.isAdmin) {
                return null;
              }

              const href =
                item.text === 'Profile' ? `/profile/${user?.uid}` : item.href;
              const isNotifications = item.text === 'Notifications';
              const isActive = href && pathname.startsWith(href);

              return (
                <Link
                  key={item.text}
                  href={href || '#'}
                  onClick={handleLinkClick}
                  className={cn(
                    "group flex items-center gap-4 rounded-lg px-3 py-3 text-lg font-medium transition-colors hover:bg-accent/50",
                    isActive && "bg-accent/80"
                  )}
                >
                  <div className="relative">
                    <item.icon className="h-6 w-6" />
                    {isNotifications && unreadCount > 0 && (
                      <Badge className="absolute -right-2 -top-1 h-5 w-5 justify-center rounded-full p-0 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                  <span className="font-sans">{item.text}</span>
                </Link>
              );
            })}
          </nav>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="px-3 text-sm font-medium text-muted-foreground">Theme</h3>
            <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" /> Light
                </Button>
                <Button variant="outline" onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" /> Dark
                </Button>
                <Button variant="outline" onClick={() => setTheme('system')}>
                  <Laptop className="mr-2 h-4 w-4" /> System
                </Button>
            </div>
          </div>

          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Log out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
