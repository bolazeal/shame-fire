
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/user-avatar';
import { Loader2, TrendingUp, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getUsersToFollow, getTrendingTopics } from '@/lib/firestore';
import { toggleFollowAction, trackSuggestionFollowAction, dismissSuggestionAction } from '@/lib/actions/interaction';
import type { User } from '@/lib/types';
import { Input } from '../ui/input';

interface Trend {
    category: string;
    count: number;
}
interface UserToFollow extends User {
    isFollowing: boolean;
    isFollowLoading: boolean;
}

export function RightSidebar() {
    const { user: authUser } = useAuth();
    const [usersToFollow, setUsersToFollow] = useState<UserToFollow[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);

    const [trends, setTrends] = useState<Trend[]>([]);
    const [loadingTrends, setLoadingTrends] = useState(true);

    useEffect(() => {
        async function fetchTrends() {
            setLoadingTrends(true);
            try {
                const trendingTopics = await getTrendingTopics();
                setTrends(trendingTopics);
            } catch (error) {
                console.error("Failed to fetch trends:", error);
            } finally {
                setLoadingTrends(false);
            }
        }
        fetchTrends();
    }, []);

    const fetchUsers = async () => {
        if (!authUser) {
            setLoadingUsers(false);
            return;
        }
        setLoadingUsers(true);
        try {
            const users = await getUsersToFollow(authUser.uid);
            const usersWithFollowStatus = users.map(user => ({ ...user, isFollowing: false, isFollowLoading: false }));
            setUsersToFollow(usersWithFollowStatus);
        } catch (error) {
            console.error("Error fetching users to follow:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [authUser]);

    const handleFollowToggle = async (userId: string, suggestionSource: string) => {
        if (!authUser) return;

        setUsersToFollow(prevUsers =>
            prevUsers.map(user =>
                user.id === userId ? { ...user, isFollowLoading: true } : user
            )
        );
        
        const userToUpdate = usersToFollow.find(u => u.id === userId);
        if (!userToUpdate) return;

        try {
            await toggleFollowAction(authUser.uid, userId, userToUpdate.isFollowing);
            
            if (!userToUpdate.isFollowing) {
              await trackSuggestionFollowAction(authUser.uid, userId, suggestionSource);
            }
            
            // Remove user from list after following
            setUsersToFollow(prevUsers => prevUsers.filter(user => user.id !== userId));

        } catch (error) {
            console.error("Failed to toggle follow:", error);
        }
    };
    
    const handleDismiss = async (userId: string, suggestionSource: string) => {
        if (!authUser) return;
    
        await dismissSuggestionAction(authUser.uid, userId, suggestionSource);
        
        setUsersToFollow(prevUsers => prevUsers.filter(user => user.id !== userId));
    };


    return (
        <aside className="sticky top-0 hidden h-screen w-80 flex-col gap-4 p-4 lg:flex">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search"
                    className="w-full rounded-full bg-muted pl-10"
                />
            </div>
            
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Trends for you
                </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                <div className="flex flex-col">
                    {loadingTrends ? (
                         <div className="py-4 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                    ) : trends.length > 0 ? (
                        trends.map((trend) => (
                            <Link
                                key={trend.category}
                                href={`/search?q=${encodeURIComponent(trend.category)}`}
                                className="border-b border-border px-6 py-4 transition-colors last:border-b-0 hover:bg-accent/50"
                            >
                                <p className="text-sm text-muted-foreground">
                                Trending in Shame
                                </p>
                                <p className="font-bold">#{trend.category.replace(/\s+/g, '')}</p>
                                <p className="text-sm text-muted-foreground">
                                {trend.count.toLocaleString()} posts
                                </p>
                            </Link>
                        ))
                    ) : (
                        <p className="p-4 text-center text-muted-foreground">No trends right now.</p>
                    )}
                </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Who to follow</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col px-6">
                {loadingUsers ? (
                    <div className="py-4 text-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (
                    usersToFollow.map((user, index) => (
                    <React.Fragment key={user.id}>
                        <div className="group relative flex items-center justify-between py-4">
                        <Button variant="ghost" size="icon" className="absolute -right-2 top-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100" onClick={() => handleDismiss(user.id, user.suggestionSource || 'unknown')}>
                            <X className="h-4 w-4"/>
                        </Button>
                        <Link
                            href={`/profile/${user.id}`}
                            className="flex items-center gap-2"
                        >
                            <UserAvatar user={user} className="h-10 w-10" />
                            <div>
                            <p className="font-bold hover:underline">{user.name}</p>
                            <p className="text-sm text-muted-foreground">
                                @{user.username}
                            </p>
                            </div>
                        </Link>
                        <Button
                            variant={'default'}
                            size="sm"
                            className="rounded-full font-bold"
                            onClick={() => handleFollowToggle(user.id, user.suggestionSource || 'unknown')}
                            disabled={user.isFollowLoading}
                        >
                            {user.isFollowLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Follow'}
                        </Button>
                        </div>
                        {index < usersToFollow.length - 1 && <Separator className="bg-border" />}
                    </React.Fragment>
                    ))
                )}
                </CardContent>
            </Card>
        </aside>
    );
}
