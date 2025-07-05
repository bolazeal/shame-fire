
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/user-avatar';
import { Trophy, Medal, Info, FileText, Loader2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getUsersToFollow, toggleFollow, isFollowing, getTrendingTopics } from '@/lib/firestore';
import type { User } from '@/lib/types';

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

    useEffect(() => {
        async function fetchUsers() {
            if (!authUser) {
                setLoadingUsers(false);
                return;
            }
            setLoadingUsers(true);
            const users = await getUsersToFollow(authUser.uid);
            const usersWithFollowStatus = await Promise.all(
                users.map(async (user) => {
                    const followingStatus = await isFollowing(authUser.uid, user.id);
                    return { ...user, isFollowing: followingStatus, isFollowLoading: false };
                })
            );
            setUsersToFollow(usersWithFollowStatus);
            setLoadingUsers(false);
        }

        fetchUsers();
    }, [authUser]);

    const handleFollowToggle = async (userId: string) => {
        if (!authUser) return;

        setUsersToFollow(prevUsers =>
            prevUsers.map(user =>
                user.id === userId ? { ...user, isFollowLoading: true } : user
            )
        );

        try {
            const userToUpdate = usersToFollow.find(u => u.id === userId);
            if(userToUpdate) {
                await toggleFollow(authUser.uid, userId, userToUpdate.isFollowing);
                setUsersToFollow(prevUsers =>
                    prevUsers.map(user =>
                        user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
                    )
                );
            }
        } catch (error) {
            console.error("Failed to toggle follow:", error);
        } finally {
            setUsersToFollow(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, isFollowLoading: false } : user
                )
            );
        }
    };


    return (
        <aside className="sticky top-0 hidden h-screen w-80 flex-col gap-4 p-4 lg:flex">
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Hall of Honour
                </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                <Button asChild variant="ghost" className="justify-start">
                    <Link href="/hall-of-honour#past-winners">
                    <Medal className="mr-2 h-4 w-4" />
                    View Past Winners
                    </Link>
                </Button>
                <Button asChild variant="ghost" className="justify-start">
                    <Link href="/hall-of-honour">
                    <FileText className="mr-2 h-4 w-4" />
                    See Nomination Status
                    </Link>
                </Button>
                <Button asChild variant="ghost" className="justify-start">
                    <Link href="/hall-of-honour#nomination-criteria">
                    <Info className="mr-2 h-4 w-4" />
                    Learn About Medal Criteria
                    </Link>
                </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    What’s happening
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
                                className="border-b px-6 py-4 transition-colors last:border-b-0 hover:bg-accent/50"
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
                        <div className="flex items-center justify-between py-4">
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
                            variant={user.isFollowing ? 'secondary' : 'outline'}
                            size="sm"
                            className="rounded-full font-bold"
                            onClick={() => handleFollowToggle(user.id)}
                            disabled={user.isFollowLoading}
                        >
                            {user.isFollowLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (user.isFollowing ? 'Following' : 'Follow')}
                        </Button>
                        </div>
                        {index < usersToFollow.length - 1 && <Separator />}
                    </React.Fragment>
                    ))
                )}
                </CardContent>
            </Card>
        </aside>
    );
}
