
'use client';

import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex w-full max-w-lg items-end gap-2',
        isOwnMessage ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'
      )}
    >
      <div
        className={cn(
          'rounded-2xl px-4 py-2',
          isOwnMessage
            ? 'rounded-br-lg bg-primary text-primary-foreground'
            : 'rounded-bl-lg bg-background'
        )}
      >
        <p className="text-base">{message.text}</p>
      </div>
    </div>
  );
}
