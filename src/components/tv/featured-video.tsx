
'use client';
import type { Video } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface FeaturedVideoProps {
  video: Video;
}

export function FeaturedVideo({ video }: FeaturedVideoProps) {
  return (
    <div className="flex-1">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
        <video
          key={video.id} // Add key to force re-render when video changes
          src={video.videoUrl}
          controls
          autoPlay
          poster={video.thumbnailUrl}
          className="h-full w-full"
        >
          Your browser does not support the video tag.
        </video>
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
            <Button variant="outline">Share</Button>
        </div>
      </div>
    </div>
  );
}
