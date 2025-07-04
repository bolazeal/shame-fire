
'use client';

import { useContext } from 'react';
import { NotificationContext } from '@/context/notification-context';
import type { NotificationContextType } from '@/lib/types';

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
