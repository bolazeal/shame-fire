'use client';

import { createContext, ReactNode, useCallback } from 'react';
import type { ModerationContextType, PostCreationData, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addFlaggedItemToQueue } from '@/lib/firestore';

export const ModerationContext = createContext<ModerationContextType | undefined>(
  undefined
);

export const ModerationProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();

  const addFlaggedItem = useCallback(
    async (postData: PostCreationData, author: User, reason: string) => {
      try {
        await addFlaggedItemToQueue({
          postData,
          author,
          reason,
        });
      } catch (error) {
        console.error('Failed to add item to moderation queue:', error);
        toast({
          title: 'Moderation Error',
          description: 'Could not send item for review. Please try again.',
          variant: 'destructive',
        });
        // re-throw to notify caller
        throw error;
      }
    },
    [toast]
  );

  const value = {
    addFlaggedItem,
  };

  return (
    <ModerationContext.Provider value={value}>
      {children}
    </ModerationContext.Provider>
  );
};
