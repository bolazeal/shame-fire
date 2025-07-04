
'use client';

import type { Notification } from '@/lib/types';
import { UserAvatar } from './user-avatar';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, ThumbsUp, Repeat, UserPlus } from 'lucide-react';

interface NotificationCardProps {
  notification: Notification;
}

const notificationIcons = {
  follow: UserPlus,
  upvote: ThumbsUp,
  repost: Repeat,
  comment: MessageCircle,
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
      default:
        return {
          text: <>New notification</>,
          href: '#',
          Icon: MessageCircle,
        };
    }
};

export function NotificationCard({ notification }: NotificationCardProps) {
  const { text, href, Icon } = getNotificationTextAndLink(notification);
  const notificationDate = new Date(notification.createdAt);

  return (
    <Link href={href}>
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
                    'text-primary': ['follow', 'comment'].includes(notification.type),
                })} />
            </div>
        </div>
        <div className="flex-1">
          <p className="text-base text-foreground">{text}</p>
          <p className="text-sm text-muted-foreground">
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
