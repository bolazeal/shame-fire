import { Bookmark } from 'lucide-react';
import { PostCard } from '@/components/post-card';
import { getBookmarkedPosts } from '@/lib/firestore';
import type { Post } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { headers } from 'next/headers';

async function getBookmarks() {
  // We need a way to get the current user on the server.
  // This is a simplified example. In a real app, you'd use a more robust session management.
  // For this project, we'll assume we can get the user ID.
  // Note: auth.currentUser is not available on the server.
  // A common pattern is to use a library like next-auth or manage sessions manually.
  // Given the current structure, let's adapt to get user ID server-side if possible,
  // but for bookmarks, it's tricky without a proper session.
  // Let's assume we can't get bookmarks server-side without a big auth refactor.
  // Let's revert this page to client-side for now, as bookmarks are user-specific
  // and auth is client-side. The previous refactor was too aggressive for this page.
  // Let's go back to the original client-side implementation.
}


// Let's stick to client-side fetching for this page since auth is client-side.
// The previous attempt to make it a server component was not feasible without
// a major authentication refactor.

'use client';

import { useState, useEffect, useCallback } from 'react';
import { PostCard } from '@/components/post-card';
import { useAuth } from '@/hooks/use-auth';
import { getBookmarkedPosts } from '@/lib/firestore';
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
