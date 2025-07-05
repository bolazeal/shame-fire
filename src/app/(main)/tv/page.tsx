'use client';
import { Tv } from 'lucide-react';
import { mockVideos } from '@/lib/mock-data';
import { useState } from 'react';
import { FeaturedVideo } from '@/components/tv/featured-video';
import { VideoPlaylistItem } from '@/components/tv/video-playlist-item';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TVPage() {
  const [activeVideo, setActiveVideo] = useState(mockVideos[0]);

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <Tv className="h-6 w-6" />
        <h1 className="text-xl font-bold font-headline">Shame or Shine TV</h1>
      </header>
      <main className="flex flex-1 flex-col gap-8 p-4 lg:flex-row">
        <FeaturedVideo video={activeVideo} />
        <aside className="w-full lg:w-96">
            <h3 className="mb-4 text-lg font-bold">Up Next</h3>
            <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="flex flex-col gap-2 pr-4">
                    {mockVideos.map(video => (
                        <VideoPlaylistItem 
                            key={video.id}
                            video={video}
                            isActive={video.id === activeVideo.id}
                            onClick={() => setActiveVideo(video)}
                        />
                    ))}
                </div>
            </ScrollArea>
        </aside>
      </main>
    </div>
  );
}
