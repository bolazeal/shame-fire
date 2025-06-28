'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/user-avatar';
import { mockUsers } from '@/lib/mock-data';
import { Search } from 'lucide-react';

const trends = [
  { category: 'Technology', topic: '#AI_Ethics', posts: '12.5K' },
  { category: 'Business', topic: 'RemoteWork', posts: '45K' },
  { category: 'Health', topic: '#Mindfulness', posts: '23K' },
];

const usersToFollow = [mockUsers.user2, mockUsers.user3, mockUsers.user4];

export function RightSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-80 flex-col gap-4 p-4 lg:flex">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input placeholder="Search" className="rounded-full pl-10" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>What’s happening</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {trends.map((trend, index) => (
            <div key={index}>
              <p className="text-sm text-muted-foreground">{trend.category}</p>
              <p className="font-bold">{trend.topic}</p>
              <p className="text-sm text-muted-foreground">{trend.posts} posts</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {usersToFollow.map((user, index) => (
            <>
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserAvatar user={user} className="h-10 w-10" />
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">Follow</Button>
              </div>
              {index < usersToFollow.length - 1 && <Separator />}
            </>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}
