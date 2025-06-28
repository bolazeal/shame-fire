'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/user-avatar';
import { mockUsers } from '@/lib/mock-data';
import { Trophy, Medal, Info, FileText } from 'lucide-react';
import Link from 'next/link';

const trends = [
  { category: 'Technology', topic: '#AI_Ethics', posts: '12.5K' },
  { category: 'Business', topic: 'RemoteWork', posts: '45K' },
  { category: 'Health', topic: '#Mindfulness', posts: '23K' },
];

export function RightSidebar() {
  const initialUsers = [
    mockUsers.user2,
    mockUsers.user3,
    mockUsers.user4,
    mockUsers.user5,
  ];
  const [usersToFollow, setUsersToFollow] = React.useState(
    initialUsers.map((u) => ({ ...u, isFollowing: false }))
  );

  const handleFollowToggle = (userId: string) => {
    setUsersToFollow((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
      )
    );
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
          <Link href="/hall-of-honour#past-winners" asChild>
            <Button variant="ghost" className="justify-start">
              <Medal className="mr-2 h-4 w-4" />
              View Past Winners
            </Button>
          </Link>
          <Link href="/hall-of-honour" asChild>
            <Button variant="ghost" className="justify-start">
              <FileText className="mr-2 h-4 w-4" />
              See Nomination Status
            </Button>
          </Link>
          <Link href="/hall-of-honour#nomination-criteria" asChild>
            <Button variant="ghost" className="justify-start">
              <Info className="mr-2 h-4 w-4" />
              Learn About Medal Criteria
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What’s happening</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col">
            {trends.map((trend) => (
              <Link
                key={trend.topic}
                href="#"
                className="border-b px-6 py-4 transition-colors last:border-b-0 hover:bg-accent/50"
              >
                <p className="text-sm text-muted-foreground">
                  {trend.category}
                </p>
                <p className="font-bold">{trend.topic}</p>
                <p className="text-sm text-muted-foreground">
                  {trend.posts} posts
                </p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {usersToFollow.map((user, index) => (
            <React.Fragment key={user.id}>
              <div className="flex items-center justify-between">
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
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
              {index < usersToFollow.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}
