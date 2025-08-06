
'use client';

import type { Notification } from '@/lib/types';
import { UserAvatar } from './user-avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ArrowBigUp, Share2, UserPlus, AtSign } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { markNotificationAsReadAction } from '@/lib/actions/notification';

interface NotificationCardProps {
  notification: Notification;
}

const notificationIcons = {
  follow: UserPlus,
  upvote: ArrowBigUp,
  repost: Share2,
  comment: MessageSquare,
  mention: AtSign,
};

const getNotificationTextAndLink = (notification: Notification) => {
    const sender = <span className="font-bold">{notification.sender.name}</span>;
    switch (notification.type) {
      case 'follow':
        return {
          text: <>{sender} followed you.</>,
          href: `/profile/${notification.sender.id}`,
          Icon: notificationIcons.follow,
        };
      case 'upvote':
        return {
          text: <>{sender} liked your post: <span className="italic">"{notification.postText}"</span></>,
          href: `/post/${notification.postId}`,
          Icon: notificationIcons.upvote,
        };
      case 'repost':
        return {
          text: <>{sender} reposted your post: <span className="italic">"{notification.postText}"</span></>,
          href: `/post/${notification.postId}`,
          Icon: notificationIcons.repost,
        };
      case 'comment':
        return {
          text: <>{sender} commented on your post: <span className="italic">"{notification.postText}"</span></>,
          href: `/post/${notification.postId}`,
          Icon: notificationIcons.comment,
        };
      case 'mention':
        return {
            text: <>{sender} mentioned you in a post: <span className="italic">"{notification.postText}"</span></>,
            href: `/post/${notification.postId}`,
            Icon: notificationIcons.mention,
        };
      default:
        return {
          text: <>New notification</>,
          href: '#',
          Icon: MessageSquare,
        };
    }
};

export function NotificationCard({ notification }: NotificationCardProps) {
  const { user } = useAuth();
  const { text, href, Icon } = getNotificationTextAndLink(notification);
  const notificationDate = new Date(notification.createdAt);

  const handleClick = async () => {
    if (user && !notification.read) {
      try {
        await markNotificationAsReadAction(user.uid, notification.id);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        // Do not show toast for this background action
      }
    }
  };


  return (
    <Link href={href} onClick={handleClick}>
      <div
        className={cn(
          'flex items-start gap-4 p-4 border-b transition-colors hover:bg-accent/50',
          !notification.read && 'bg-primary/5'
        )}
      >
        <div className="relative">
            <UserAvatar user={notification.sender} className="h-12 w-12" />
            <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-0.5">
                <Icon className={cn("h-5 w-5", {
                    'text-sky-500': notification.type === 'upvote',
                    'text-green-500': notification.type === 'repost',
                    'text-primary': ['follow', 'comment', 'mention'].includes(notification.type),
                })} />
            </div>
        </div>
        <div className="flex-1">
          <p className="text-base text-foreground">{text}</p>
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            {formatDistanceToNow(notificationDate, { addSuffix: true })}
          </p>
        </div>
        {!notification.read && (
            <div className="mt-2 h-3 w-3 rounded-full bg-primary" />
        )}
      </div>
    </Link>
  );
}
