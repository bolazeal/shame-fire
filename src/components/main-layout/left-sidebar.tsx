
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShameLogo } from '@/components/shame-logo';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '../user-avatar';
import { useNotification } from '@/hooks/use-notification';
import { Badge } from '../ui/badge';
import { useTheme } from 'next-themes';
import {
  Home,
  Tv,
  Bell,
  Mail,
  Bookmark,
  Landmark,
  Trophy,
  User,
  Shield,
  PenSquare,
  Sun,
  Moon,
  Laptop,
  LogOut,
  MoreHorizontal,
} from 'lucide-react';

const navItems = [
  { href: '/home', icon: Home, text: 'Home' },
  { href: '/tv', icon: Tv, text: 'Shame TV' },
  { href: '/notifications', icon: Bell, text: 'Notifications' },
  { href: '/messages', icon: Mail, text: 'Messages' },
  { href: '/bookmarks', icon: Bookmark, text: 'Bookmarks' },
  { href: '/village-square', icon: Landmark, text: 'Village Square' },
  { href: '/hall-of-honour', icon: Trophy, text: 'Hall of Honour' },
  { href: '/profile', icon: User, text: 'Profile' },
  { href: '/admin', icon: Shield, text: 'Admin Panel' },
];

export function LeftSidebar() {
  const { user, logout, fullProfile } = useAuth();
  const { unreadCount } = useNotification();
  const { setTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-col justify-between p-2 lg:flex">
      <div>
        <div className="p-4">
          <Link href="/home">
            <ShameLogo />
          </Link>
        </div>
        <nav className="flex flex-col">
          {navItems.map((item) => {
            if (item.href === '/admin' && !fullProfile?.isAdmin) {
              return null;
            }

            const href =
              item.text === 'Profile' ? `/profile/${user?.uid}` : item.href;
            const isNotifications = item.text === 'Notifications';

            return (
              <Link
                key={item.text}
                href={href}
                className="group flex items-center gap-4 rounded-full px-4 py-3 text-lg font-medium transition-colors hover:bg-accent/50"
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
        <CreatePostDialog
          trigger={
            <Button className="mt-4 w-full rounded-full py-6 text-lg">
              <PenSquare className="mr-2 h-5 w-5" /> Post
            </Button>
          }
        />
      </div>
      <div className="p-4">
        {user && fullProfile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-auto w-full items-center justify-between rounded-full p-2 text-left hover:bg-accent/50"
              >
                <div className="flex items-center gap-2">
                  <UserAvatar user={fullProfile} className="h-10 w-10" />
                  <div>
                    <p className="font-bold">{fullProfile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{fullProfile.username}
                    </p>
                  </div>
                </div>
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Toggle Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')}>
                      <Laptop className="mr-2 h-4 w-4" />
                      <span>System</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </aside>
  );
}
