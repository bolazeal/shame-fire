'use client';
import type { Video } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';

interface FeaturedVideoProps {
  video: Video;
}

export function FeaturedVideo({ video }: FeaturedVideoProps) {
  return (
    <div className="flex-1">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-lg">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill={true}
          style={{ objectFit: 'cover' }}
          data-ai-hint={video['data-ai-hint']}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <PlayCircle className="h-24 w-24 cursor-pointer text-white/80 transition-transform hover:scale-110" />
        </div>
      </div>
      <div className="mt-4">
        <h2 className="text-3xl font-bold font-headline">{video.title}</h2>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{video.channel}</span>
            <span>&bull;</span>
            <span>{video.views}</span>
            <span>&bull;</span>
            <span>{video.uploadedAt}</span>
        </div>
        <p className="mt-4 text-base">{video.description}</p>
        <div className="mt-4 flex gap-2">
            <Button>Watch Now</Button>
            <Button variant="outline">Share</Button>
        </div>
      </div>
    </div>
  );
}
