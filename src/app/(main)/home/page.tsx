
'use client';

import { PostCard } from '@/components/post-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Post } from '@/lib/types';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getPosts } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import type { DocumentSnapshot } from 'firebase/firestore';

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
  const { user } = useAuth();
  const [filter, setFilter] = useState<'foryou' | 'posts' | 'reports' | 'endorsements'>('foryou');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver>();
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);


  const fetchInitialPosts = useCallback(async () => {
    setLoading(true);
    setPosts([]);
    setLastDoc(null);
    setHasMore(true);
    try {
      const { posts: fetchedPosts, lastVisible } = await getPosts({
        filter,
        userId: filter === 'foryou' ? user?.uid : undefined,
      });
      setPosts(fetchedPosts);
      setLastDoc(lastVisible);
      if (fetchedPosts.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, user?.uid]);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore || !lastDoc) return;
    setLoadingMore(true);
    try {
      const { posts: newPosts, lastVisible } = await getPosts({
        filter,
        userId: filter === 'foryou' ? user?.uid : undefined,
        startAfter: lastDoc,
      });
      setPosts(prev => [...prev, ...newPosts]);
      setLastDoc(lastVisible);
      if (newPosts.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, lastDoc, filter, user?.uid]);

  useEffect(() => {
    fetchInitialPosts();
  }, [fetchInitialPosts]);
  
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter as any);
  };


  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <h1 className="text-xl font-bold font-headline">Home</h1>
      </header>

      <Tabs defaultValue="foryou" onValueChange={handleFilterChange} className="w-full">
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
                    posts.map((post, index) => {
                      if (posts.length === index + 1) {
                        return <div ref={lastPostElementRef} key={post.id}><PostCard post={post} /></div>
                      } else {
                        return <PostCard key={post.id} post={post} />
                      }
                    })
                ) : (
                    <p className="p-4 text-center text-muted-foreground">
                        {filter === 'foryou' ? 'Follow people to see their posts here.' : `No ${filter} yet.`}
                    </p>
                )}
                 {loadingMore && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                 {!loading && posts.length > 0 && !hasMore && (
                    <p className="p-4 text-center text-sm text-muted-foreground">
                        You've reached the end.
                    </p>
                 )}
            </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
