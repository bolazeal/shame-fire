
'use client';

import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import Image from 'next/image';

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
        {message.mediaUrl && (
          <div
            className="relative mb-2 aspect-video w-full max-w-sm overflow-hidden rounded-lg border"
            onClick={(e) => e.stopPropagation()}
          >
            {message.mediaType === 'image' ? (
              <Image
                src={message.mediaUrl}
                alt="Message media"
                fill={true}
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <video
                src={message.mediaUrl}
                controls
                className="h-full w-full bg-black object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        )}
        {message.text && <p className="text-base">{message.text}</p>}
      </div>
    </div>
  );
}
