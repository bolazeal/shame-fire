'use client';
import { Tv } from 'lucide-react';
import { useState, useEffect } from 'react';
import { FeaturedVideo } from '@/components/tv/featured-video';
import { VideoPlaylistItem } from '@/components/tv/video-playlist-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getVideos } from '@/lib/firestore';
import type { Video } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function TVPageSkeleton() {
    return (
        <div className="flex h-full flex-col">
            <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
                <Tv className="h-6 w-6" />
                <h1 className="text-xl font-bold font-headline">Shame TV</h1>
            </header>
            <main className="flex flex-1 flex-col gap-8 p-4 lg:flex-row">
                <div className="flex-1">
                    <Skeleton className="aspect-video w-full rounded-xl" />
                    <div className="mt-4 space-y-2">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="mt-4 h-16 w-full" />
                    </div>
                </div>
                <aside className="w-full lg:w-96">
                    <h3 className="mb-4 text-lg font-bold">Up Next</h3>
                    <div className="flex flex-col gap-2 pr-4">
                        {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex w-full gap-3 rounded-lg p-2">
                            <Skeleton className="relative aspect-video h-20 shrink-0 overflow-hidden rounded-md" />
                            <div className="flex-1 py-1 space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <Skeleton className="h-3 w-1/3" />
                            </div>
                        </div>
                        ))}
                    </div>
                </aside>
            </main>
        </div>
    );
}

export default function TVPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
        setLoading(true);
        try {
            const fetchedVideos = await getVideos();
            setVideos(fetchedVideos);
            if (fetchedVideos.length > 0) {
                setActiveVideo(fetchedVideos[0]);
            }
        } catch (error) {
            console.error("Failed to fetch videos:", error);
            // Optionally, show a toast
        } finally {
            setLoading(false);
        }
    }
    fetchVideos();
  }, []);

  if (loading) {
      return <TVPageSkeleton />;
  }
  
  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <Tv className="h-6 w-6" />
        <h1 className="text-xl font-bold font-headline">Shame TV</h1>
      </header>
      
      {videos.length === 0 || !activeVideo ? (
        <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">No videos available at the moment.</p>
        </div>
      ) : (
        <main className="flex flex-1 flex-col gap-8 p-4 lg:flex-row">
            <FeaturedVideo video={activeVideo} />
            <aside className="w-full lg:w-96">
                <h3 className="mb-4 text-lg font-bold">Up Next</h3>
                <ScrollArea className="h-[calc(100vh-250px)]">
                    <div className="flex flex-col gap-2 pr-4">
                        {videos.map(video => (
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
      )}
    </div>
  );
}
