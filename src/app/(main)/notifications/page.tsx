
'use client';

import { Bell, Loader2 } from 'lucide-react';
import { useNotification } from '@/hooks/use-notification';
import { NotificationCard } from '@/components/notification-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function NotificationSkeleton() {
    return (
      <div className="flex items-start gap-4 p-4 border-b">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-3 w-3 rounded-full" />
      </div>
    );
  }

export default function NotificationsPage() {
  const { notifications, loading, unreadCount, markAllAsRead } = useNotification();

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6" />
          <h1 className="text-xl font-bold font-headline">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </header>
      <div className="flex flex-col">
        {loading ? (
            <>
                <NotificationSkeleton />
                <NotificationSkeleton />
                <NotificationSkeleton />
                <NotificationSkeleton />
            </>
        ) : notifications.length === 0 ? (
          <div className="flex h-[calc(100vh-120px)] items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold">No notifications yet</h2>
              <p className="text-muted-foreground">
                When someone interacts with you, it'll show up here.
              </p>
            </div>
          </div>
        ) : (
          notifications.map((notif) => (
            <NotificationCard key={notif.id} notification={notif} />
          ))
        )}
      </div>
    </div>
  );
}
