
'use client';

import {
  Bell,
  Bookmark,
  Home,
  Landmark,
  LogOut,
  Mail,
  MoreHorizontal,
  PenSquare,
  Shield,
  Trophy,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShameLogo } from '@/components/shame-logo';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { href: '/home', icon: Home, text: 'Home' },
  { href: '/notifications', icon: Bell, text: 'Notifications' },
  { href: '/messages', icon: Mail, text: 'Messages' },
  { href: '/bookmarks', icon: Bookmark, text: 'Bookmarks' },
  { href: '/village-square', icon: Landmark, text: 'Village Square' },
  { href: '/hall-of-honour', icon: Trophy, text: 'Hall of Honour' },
  { href: '/profile/user1', icon: User, text: 'Profile' },
  { href: '/admin', icon: Shield, text: 'Admin Panel' },
];

export function LeftSidebar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const getUsername = (email: string | null) => {
    if (!email) return 'user';
    return email.split('@')[0];
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
            // In a real app, this would check a role from the user's profile
            if (item.href === '/admin' && user?.uid !== 'user1') {
              return null;
            }
            return (
              <Link
                key={item.text}
                href={item.href}
                className="flex items-center gap-4 rounded-full px-4 py-3 text-lg font-medium transition-colors hover:bg-accent/50"
              >
                <item.icon className="h-6 w-6" />
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-auto w-full items-center justify-between rounded-full p-2 text-left hover:bg-accent/50"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {user?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-bold">{user?.displayName}</p>
                  <p className="text-sm text-muted-foreground">
                    @{getUsername(user?.email)}
                  </p>
                </div>
              </div>
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
