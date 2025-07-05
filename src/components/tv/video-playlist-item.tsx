'use client';
import type { Video } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface VideoPlaylistItemProps {
  video: Video;
  isActive: boolean;
  onClick: () => void;
}

export function VideoPlaylistItem({ video, isActive, onClick }: VideoPlaylistItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent/50',
        isActive && 'bg-accent'
      )}
    >
      <div className="relative aspect-video h-20 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill={true}
          style={{ objectFit: 'cover' }}
          data-ai-hint={video['data-ai-hint']}
        />
        <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
          {video.duration}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="line-clamp-2 font-semibold">{video.title}</h3>
        <p className="text-sm text-muted-foreground">{video.channel}</p>
        <p className="text-sm text-muted-foreground">{video.views}</p>
      </div>
    </button>
  );
}
