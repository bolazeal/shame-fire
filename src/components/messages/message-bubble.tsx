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
        'flex w-full items-end gap-2',
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div
        className={cn(
          'max-w-xs rounded-lg px-3 py-2 lg:max-w-md',
          isOwnMessage
            ? 'rounded-br-none bg-primary text-primary-foreground'
            : 'rounded-bl-none bg-muted'
        )}
      >
        <p className="text-base">{message.text}</p>
      </div>
    </div>
  );
}
