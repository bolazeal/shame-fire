'use client';

import { cn } from '@/lib/utils';
import type { Conversation } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { UserAvatar } from '../user-avatar';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  isLoading: boolean;
}

function ConversationSkeleton() {
    return (
      <div className="flex items-center gap-3 p-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="w-full space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    );
  }

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  isLoading,
}: ConversationListProps) {
  const { user: currentUser } = useAuth();

  return (
    <div className="h-full border-r">
      <header className="border-b p-4">
        <h2 className="text-xl font-bold font-headline">Messages</h2>
        {/* Search input can go here later */}
      </header>
      <div className="flex flex-col">
        {isLoading ? (
            <>
                <ConversationSkeleton />
                <ConversationSkeleton />
                <ConversationSkeleton />
            </>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No conversations yet.
          </div>
        ) : (
          conversations.map((convo) => {
            const otherParticipant = convo.participants.find(
              (p) => p.id !== currentUser?.uid
            );
            if (!otherParticipant) return null;

            const isSelected = convo.id === selectedConversationId;
            const lastMessageDate = convo.lastMessageTimestamp
              ? new Date(convo.lastMessageTimestamp)
              : null;

            return (
              <button
                key={convo.id}
                onClick={() => onSelectConversation(convo.id)}
                className={cn(
                  'flex w-full items-center gap-3 border-b p-3 text-left transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring',
                  isSelected && 'bg-accent'
                )}
              >
                <UserAvatar user={otherParticipant} />
                <div className="w-full overflow-hidden">
                  <div className="flex items-baseline justify-between">
                    <p className="truncate font-bold">{otherParticipant.name}</p>
                    {lastMessageDate && (
                      <p className="flex-shrink-0 text-xs text-muted-foreground">
                        {formatDistanceToNow(lastMessageDate, { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {convo.lastMessageSenderId === currentUser?.uid && 'You: '}
                    {convo.lastMessageText}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
