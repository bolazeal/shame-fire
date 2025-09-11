
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { UserAvatar } from './user-avatar';
import Link from 'next/link';
import { isFollowing } from '@/lib/firestore';
import { toggleFollowAction } from '@/lib/actions/interaction';

function UserRowSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  );
}

function UserRow({ user, isCurrentUserProfile }: { user: User, isCurrentUserProfile: boolean }) {
  const { user: authUser } = useAuth();
  const [isFollowingState, setIsFollowingState] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const isSelf = authUser?.uid === user.id;

  useState(() => {
    async function checkFollowStatus() {
      if (!authUser || isSelf) {
        setIsCheckingStatus(false);
        return;
      }
      setIsCheckingStatus(true);
      const followingStatus = await isFollowing(authUser.uid, user.id);
      setIsFollowingState(followingStatus);
      setIsCheckingStatus(false);
    }
    checkFollowStatus();
  });

  const handleFollowToggle = async () => {
    if (!authUser || isFollowLoading || isCheckingStatus) return;

    setIsFollowLoading(true);
    try {
      await toggleFollowAction(authUser.uid, user.id, isFollowingState);
      setIsFollowingState(!isFollowingState);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4">
      <Link
        href={`/profile/${user.id}`}
        className="flex flex-1 items-center gap-4 overflow-hidden"
      >
        <UserAvatar user={user} />
        <div className="overflow-hidden">
          <p className="truncate font-bold">{user.name}</p>
          <p className="truncate text-muted-foreground">@{user.username}</p>
        </div>
      </Link>
      {!isSelf && authUser && (
        <Button
          variant={isFollowingState ? 'secondary' : 'outline'}
          size="sm"
          className="ml-4 w-[100px] shrink-0 rounded-full font-bold"
          onClick={handleFollowToggle}
          disabled={isFollowLoading || isCheckingStatus}
        >
          {isFollowLoading || isCheckingStatus ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isFollowingState ? (
            'Following'
          ) : (
            'Follow'
          )}
        </Button>
      )}
    </div>
  );
}

interface FollowListDialogProps {
  title: string;
  userId: string;
  fetchUsers: () => Promise<User[]>;
  trigger: React.ReactNode;
}

export function FollowListDialog({
  title,
  userId,
  fetchUsers,
  trigger,
}: FollowListDialogProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setIsLoading(true);
      try {
        const fetched = await fetchUsers();
        setUsers(fetched);
      } catch (error) {
        console.error(`Failed to fetch ${title.toLowerCase()}:`, error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96">
          {isLoading ? (
            <>
              <UserRowSkeleton />
              <UserRowSkeleton />
              <UserRowSkeleton />
            </>
          ) : users.length === 0 ? (
            <p className="p-4 text-center text-muted-foreground">
              No users to display.
            </p>
          ) : (
            users.map((user) => (
              <UserRow key={user.id} user={user} isCurrentUserProfile={user.id === userId} />
            ))
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
