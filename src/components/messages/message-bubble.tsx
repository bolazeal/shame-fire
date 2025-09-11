'use client';

import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import Image from 'next/image';
import { format } from 'date-fns';
import { useState } from 'react';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const [showTime, setShowTime] = useState(false);
  const messageDate = new Date(message.createdAt);

  return (
    <div
      className={cn(
        'group flex w-full max-w-lg flex-col',
        isOwnMessage ? 'ml-auto items-end' : 'mr-auto items-start'
      )}
      onClick={() => setShowTime(!showTime)}
    >
      <div className={cn('flex items-end gap-2', isOwnMessage && 'flex-row-reverse')}>
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
       <div
        className={cn(
          'mt-1 text-xs text-muted-foreground transition-all',
          showTime ? 'h-4 opacity-100' : 'h-0 opacity-0'
        )}
      >
        {format(messageDate, 'p')}
      </div>
    </div>
  );
}
