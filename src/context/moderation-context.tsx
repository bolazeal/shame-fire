'use client';

import { createContext, useState, ReactNode } from 'react';
import { mockFlaggedContent } from '@/lib/mock-data';
import type { FlaggedContent, ModerationContextType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const ModerationContext = createContext<ModerationContextType | undefined>(undefined);

export const ModerationProvider = ({ children }: { children: ReactNode }) => {
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>(mockFlaggedContent);
  const { toast } = useToast();

  const addFlaggedItem = (item: Omit<FlaggedContent, 'id' | 'flaggedAt'>) => {
    const newItem: FlaggedContent = {
      ...item,
      id: `flag${Date.now()}`,
      flaggedAt: new Date().toISOString(),
    };
    setFlaggedContent((prev) => [newItem, ...prev]);
  };

  const dismissFlaggedItem = (id: string) => {
    setFlaggedContent((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: 'Flag Dismissed',
      description: 'The content is no longer flagged.',
    });
  };

  const removeFlaggedItem = (id: string) => {
    setFlaggedContent((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: 'Content Removed',
      description: 'The content has been removed from the platform.',
      variant: 'destructive',
    });
  };

  const value = {
    flaggedContent,
    addFlaggedItem,
    dismissFlaggedItem,
    removeFlaggedItem,
  };

  return (
    <ModerationContext.Provider value={value}>
      {children}
    </ModerationContext.Provider>
  );
};
