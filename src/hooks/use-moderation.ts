'use client';

import { useContext } from 'react';
import { ModerationContext } from '@/context/moderation-context';
import type { ModerationContextType } from '@/lib/types';

export const useModeration = (): ModerationContextType => {
  const context = useContext(ModerationContext);
  if (context === undefined) {
    throw new Error('useModeration must be used within a ModerationProvider');
  }
  return context;
};
