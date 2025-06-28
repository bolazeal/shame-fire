'use client';

import {
  Bell,
  Bookmark,
  Home,
  Landmark,
  Mail,
  MoreHorizontal,
  PenSquare,
  Shield,
  Trophy,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShameLogo } from '../shame-logo';
import { UserAvatar } from '../user-avatar';
import { mockUsers } from '@/lib/mock-data';
import { CreatePostDialog } from '../create-post-dialog';

const navItems = [
  { href: '/home', icon: Home, text: 'Home' },
  { href: '/explore', icon: Bell, text: 'Notifications' },
  { href: '/messages', icon: Mail, text: 'Messages' },
  { href: '/bookmarks', icon: Bookmark, text: 'Bookmarks' },
  { href: '/village-square', icon: Landmark, text: 'Village Square' },
  { href: '/hall-of-honour', icon: Trophy, text: 'Hall of Honour' },
  { href: '/profile/user1', icon: User, text: 'Profile' },
  { href: '/moderation', icon: Shield, text: 'Moderation' },
];

export function LeftSidebar() {
  const currentUser = mockUsers['user1'];

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col justify-between p-2">
      <div>
        <div className="p-4">
          <Link href="/home">
            <ShameLogo />
          </Link>
        </div>
        <nav className="flex flex-col">
          {navItems.map((item) => (
            <Link
              key={item.text}
              href={item.href}
              className="flex items-center gap-4 rounded-full px-4 py-3 text-lg font-medium transition-colors hover:bg-accent/50"
            >
              <item.icon className="h-6 w-6" />
              <span className="font-sans">{item.text}</span>
            </Link>
          ))}
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
        <Button
          variant="ghost"
          className="flex h-auto w-full items-center justify-between rounded-full p-2 text-left hover:bg-accent/50"
        >
          <div className="flex items-center gap-2">
            <UserAvatar user={currentUser} className="h-10 w-10" />
            <div>
              <p className="font-bold">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground">
                @{currentUser.username}
              </p>
            </div>
          </div>
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </aside>
  );
}
