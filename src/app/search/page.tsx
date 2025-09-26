
'use client';

import { Search as SearchIcon, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback, useTransition } from 'react';
import { searchAction } from '@/lib/actions/search';
import type { Post, User } from '@/lib/types';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PostCard } from '@/components/post-card';
import { useAuth } from '@/hooks/use-auth';
import { isFollowing, getUsersToFollow } from '@/lib/firestore';
import { toggleFollowAction, dismissSuggestionAction } from '@/lib/actions/interaction';
import { useSearchParams } from 'next/navigation';

function UserResultCard({
  user,
  isSuggestion = false,
  onDismiss,
}: {
  user: User;
  isSuggestion?: boolean;
  onDismiss?: (userId: string, source: string) => void;
}) {
  const { user: authUser } = useAuth();
  const [isFollowingState, setIsFollowingState] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const isCurrentUser = authUser?.uid === user.id;

  useEffect(() => {
    async function checkFollowStatus() {
      if (!authUser || isCurrentUser) {
        setIsCheckingStatus(false);
        return;
      }
      setIsCheckingStatus(true);
      const followingStatus = await isFollowing(authUser.uid, user.id);
      setIsFollowingState(followingStatus);
      setIsCheckingStatus(false);
    }
    checkFollowStatus();
  }, [authUser, user.id, isCurrentUser]);

  const handleFollowToggle = async () => {
    if (!authUser || isFollowLoading || isCheckingStatus) return;

    setIsFollowLoading(true);
    try {
      await toggleFollowAction(authUser.uid, user.id, isFollowingState);
      setIsFollowingState(!isFollowingState);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <div className="group relative flex items-center justify-between p-4 transition-colors hover:bg-accent/50">
       {isSuggestion && onDismiss && authUser && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100"
          onClick={() => onDismiss(user.id, user.suggestionSource || 'unknown')}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <Link
        href={`/profile/${user.id}`}
        className="flex flex-1 items-center gap-4 overflow-hidden"
      >
        <UserAvatar user={user} />
        <div className="overflow-hidden">
          <p className="truncate font-bold">{user.name}</p>
          <p className="truncate text-muted-foreground">@{user.username}</p>
          {isSuggestion && user.suggestionSource && (
             <p className="text-xs text-muted-foreground">Suggested based on {user.suggestionSource}</p>
          )}
        </div>
      </Link>
      {!isCurrentUser && authUser && (
        <Button
          variant={isFollowingState ? 'secondary' : 'outline'}
          size="sm"
          className="ml-4 w-[100px] shrink-0 rounded-full font-bold"
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
  );
}

export default function SearchPage() {
  const { user: authUser } = useAuth();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<{ users: User[]; posts: Post[] } | null>(null);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [isSearching, startSearchTransition] = useTransition();
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  const showSuggestions = !query && !searchResults;

  const handleSearch = useCallback((searchTerm: string) => {
    if (searchTerm.trim().length > 1) {
      startSearchTransition(async () => {
        const results = await searchAction(searchTerm);
        setSearchResults(results);
      });
    } else {
      setSearchResults(null);
    }
  }, []);

  const fetchSuggestions = useCallback(async () => {
    if (!authUser) {
      setLoadingSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const userSuggestions = await getUsersToFollow(authUser.uid, 15);
      setSuggestions(userSuggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);
  
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, handleSearch]);

  const handleDismiss = async (userId: string, source: string) => {
    if (!authUser) return;
    setSuggestions(prev => prev.filter(u => u.id !== userId));
    await dismissSuggestionAction(authUser.uid, userId, source);
  };

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 p-2 backdrop-blur-sm sm:p-4">
        <div className="relative mx-auto max-w-xl">
          <SearchIcon className="absolute left-3 top-1/2 z-10 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for users or content..."
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
        {showSuggestions && (
          <section>
            <h2 className="p-4 text-lg font-bold">Suggested for you</h2>
            {loadingSuggestions ? (
               <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : suggestions.length > 0 ? (
                suggestions.map((user) => (
                    <UserResultCard key={user.id} user={user} isSuggestion onDismiss={handleDismiss} />
                ))
            ) : (
                <div className="p-8 text-center text-muted-foreground">
                    <h3 className="font-semibold">No new suggestions</h3>
                    <p>We'll suggest new people to follow as you interact more with the platform.</p>
                </div>
            )}
          </section>
        )}

        {!showSuggestions && !isSearching && searchResults && (searchResults.users.length > 0 || searchResults.posts.length > 0) && (
          <section>
            {searchResults.users.length > 0 && (
              <div className="border-b">
                <h2 className="p-4 text-lg font-bold">Users</h2>
                {searchResults.users.map((user) => (
                  <UserResultCard key={user.id} user={user} />
                ))}
              </div>
            )}
            {searchResults.posts.length > 0 && (
              <div>
                <h2 className="p-4 text-lg font-bold">Posts</h2>
                {searchResults.posts.map((post) => (
                  <PostCard key={post.id} post={post} authUser={authUser} />
                ))}
              </div>
            )}
          </section>
        )}

        {!showSuggestions && !isSearching && searchResults && searchResults.users.length === 0 && searchResults.posts.length === 0 && (
            <div className="flex h-[calc(100vh-200px)] items-center justify-center p-4 lg:h-[calc(100vh-120px)]">
              <div className="text-center">
                <h2 className="text-2xl font-bold">No Results Found for &quot;{query}&quot;</h2>
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
