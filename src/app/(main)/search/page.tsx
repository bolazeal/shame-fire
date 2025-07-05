'use client';

import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback, useTransition } from 'react';
import { searchAction } from '@/lib/actions/search';
import type { Post, User } from '@/lib/types';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PostCard } from '@/components/post-card';
import { useAuth } from '@/hooks/use-auth';
import { isFollowing, toggleFollow } from '@/lib/firestore';

function UserResultCard({ user }: { user: User }) {
  const { user: authUser } = useAuth();
  const [isFollowingState, setIsFollowingState] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    async function checkFollowStatus() {
      if (!authUser) {
        setIsCheckingStatus(false);
        return;
      }
      setIsCheckingStatus(true);
      const followingStatus = await isFollowing(authUser.uid, user.id);
      setIsFollowingState(followingStatus);
      setIsCheckingStatus(false);
    }
    checkFollowStatus();
  }, [authUser, user.id]);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!authUser || isFollowLoading || isCheckingStatus) return;

    setIsFollowLoading(true);
    try {
      await toggleFollow(authUser.uid, user.id, isFollowingState);
      setIsFollowingState(!isFollowingState);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      // Optional: show a toast notification on error
    } finally {
      setIsFollowLoading(false);
    }
  };

  const isCurrentUser = authUser?.uid === user.id;

  return (
    <Link
      href={`/profile/${user.id}`}
      className="block transition-colors hover:bg-accent/50"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <UserAvatar user={user} />
          <div>
            <p className="font-bold">{user.name}</p>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>
        </div>
        {!isCurrentUser && (
          <Button
            variant={isFollowingState ? 'secondary' : 'outline'}
            size="sm"
            className="w-[100px] rounded-full font-bold"
            onClick={handleFollowToggle}
            disabled={isFollowLoading || isCheckingStatus}
          >
            {isFollowLoading || isCheckingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFollowingState ? (
              'Following'
            ) : (
              'Follow'
            )}
          </Button>
        )}
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ users: User[]; posts: Post[] } | null>(null);
  const [isSearching, startSearchTransition] = useTransition();
  const [isInitialState, setIsInitialState] = useState(true);

  const handleSearch = useCallback((searchTerm: string) => {
    if (searchTerm.length > 1) {
      setIsInitialState(false);
      startSearchTransition(async () => {
        const searchResults = await searchAction(searchTerm);
        setResults(searchResults);
      });
    } else {
      setIsInitialState(true);
      setResults(null);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(query);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceTimer);
  }, [query, handleSearch]);

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 p-2 backdrop-blur-sm sm:p-4">
        <div className="relative mx-auto max-w-xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for users or categories..."
            className="w-full rounded-full bg-muted pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>
      </header>

      <div>
        {isInitialState && (
          <div className="flex h-[calc(100vh-200px)] items-center justify-center p-4 lg:h-[calc(100vh-120px)]">
            <div className="text-center">
              <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-2xl font-bold">Find anything</h2>
              <p className="text-muted-foreground">
                Search for users by name/username, or posts by category.
              </p>
            </div>
          </div>
        )}

        {!isInitialState && !isSearching && results && (results.users.length > 0 || results.posts.length > 0) && (
          <section>
            {results.users.length > 0 && (
              <div className="border-b">
                <h2 className="p-4 text-lg font-bold">Users</h2>
                {results.users.map((user) => (
                  <UserResultCard key={user.id} user={user} />
                ))}
              </div>
            )}
            {results.posts.length > 0 && (
              <div>
                <h2 className="p-4 text-lg font-bold">Posts</h2>
                {results.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </section>
        )}

        {!isInitialState && !isSearching && results && results.users.length === 0 && results.posts.length === 0 && (
            <div className="flex h-[calc(100vh-200px)] items-center justify-center p-4 lg:h-[calc(100vh-120px)]">
              <div className="text-center">
                <h2 className="text-2xl font-bold">No Results Found</h2>
                <p className="text-muted-foreground">
                  Try searching for something else.
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
