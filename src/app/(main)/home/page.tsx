'use client';

import { PostCard } from '@/components/post-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Post } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { getPosts } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';

function PostSkeleton() {
    return (
        <div className="flex gap-4 border-b p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-4 h-24 w-full" />
            </div>
        </div>
    );
}

export default function HomePage() {
  const [filter, setFilter] = useState<'foryou' | 'posts' | 'reports' | 'endorsements'>('foryou');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPosts = await getPosts(filter);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      // Optionally, show a toast message to the user
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <h1 className="text-xl font-bold font-headline">Home</h1>
      </header>

      <Tabs defaultValue="foryou" onValueChange={(val) => setFilter(val as any)} className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-4 rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="foryou"
            className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-accent/50 data-[state=active]:shadow-none"
          >
            For You
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-accent/50 data-[state=active]:shadow-none"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-accent/50 data-[state=active]:shadow-none"
          >
            Reports
          </TabsTrigger>
          <TabsTrigger
            value="endorsements"
            className="rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-accent/50 data-[state=active]:shadow-none"
          >
            Endorsements
          </TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="m-0">
            <section className="flex flex-col">
                {loading ? (
                    <>
                        <PostSkeleton />
                        <PostSkeleton />
                        <PostSkeleton />
                    </>
                ) : posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))
                ) : (
                    <p className="p-4 text-center text-muted-foreground">
                        No {filter} yet.
                    </p>
                )}
            </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
