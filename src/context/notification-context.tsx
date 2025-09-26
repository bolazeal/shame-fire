
'use client';

import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { Notification, NotificationContextType } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { fromFirestore } from '@/lib/firestore';
import { markAllAsReadAction } from '@/lib/actions/notification';

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isFirebaseConfigured) {
      setLoading(true);
      const notificationsRef = collection(db, `users/${user.uid}/notifications`);
      const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(50));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const newNotifications = snapshot.docs.map((doc) =>
            fromFirestore<Notification>(doc)
          );
          const newUnreadCount = newNotifications.filter(
            (n) => !n.read
          ).length;

          setNotifications(newNotifications);
          setUnreadCount(newUnreadCount);
          setLoading(false);
        },
        (error) => {
          console.error('Failed to listen for notifications:', error);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      // Not logged in or Firebase not configured, so clear state
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [user, isFirebaseConfigured]);

  const markAllAsRead = useCallback(async () => {
    if (!user || unreadCount === 0) return;

    // Optimistic update
    const previousNotifications = [...notifications];
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await markAllAsReadAction(user.uid);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      // Revert optimistic update on failure
      setNotifications(previousNotifications);
      setUnreadCount(previousNotifications.filter(n => !n.read).length);
    }
  }, [user, unreadCount, notifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
