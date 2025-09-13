'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bookmark } from 'lucide-react';
import { PostCard } from '@/components/post-card';
import { useAuth } from '@/hooks/use-auth';
import { getBookmarkedPosts } from '@/lib/firestore';
import type { Post } from '@/lib/types';
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

export default function BookmarksPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const bookmarkedPosts = await getBookmarkedPosts(user.uid);
      setPosts(bookmarkedPosts);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      // Optionally show a toast
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Bookmark className="h-6 w-6" />
          <h1 className="text-xl font-bold font-headline">Bookmarks</h1>
        </div>
      </header>
      
      <section>
        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : !user ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>Please log in to see your bookmarks.</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <h2 className="text-lg font-semibold text-foreground">You have no bookmarks yet</h2>
            <p>Click the bookmark icon on a post to save it for later.</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </section>
    </div>
  );
}
