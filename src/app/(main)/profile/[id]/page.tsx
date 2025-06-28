import { PostCard } from '@/components/post-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/user-avatar';
import { mockPosts, mockUsers } from '@/lib/mock-data';
import {
  Calendar,
  Link as LinkIcon,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage({ params }: { params: { id: string } }) {
  const user =
    Object.values(mockUsers).find((u) => u.id === params.id) ||
    mockUsers.user1;
  const userPosts = mockPosts.filter((p) => p.author.id === user.id);

  return (
    <div>
      <div className="relative h-48 bg-muted">
        <Image
          src="https://placehold.co/1500x500.png"
          alt="Profile banner"
          layout="fill"
          objectFit="cover"
          data-ai-hint="abstract landscape"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between">
          <UserAvatar
            user={user}
            className="-mt-20 h-32 w-32 border-4 border-background"
          />
          <Button variant="outline" className="rounded-full font-bold">
            Edit profile
          </Button>
        </div>
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold font-headline">{user.name}</h2>
            {user.isVerified && (
              <ShieldCheck className="h-6 w-6 text-primary" />
            )}
          </div>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>
        <div className="mt-4 text-base">
          <p>
            Digital craftsman, coffee enthusiast, and advocate for clarity on
            the web.
          </p>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="font-headline text-lg">
              Clarity Trust Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-primary">
                {user.trustScore}
              </span>
              <div className="flex-1">
                <Progress value={user.trustScore} className="h-3" />
                <p className="mt-1 text-sm text-muted-foreground">
                  Based on community endorsements and reports.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>San Francisco, CA</span>
          </div>
          <div className="flex items-center gap-1">
            <LinkIcon className="h-4 w-4" />
            <a href="#" className="text-primary hover:underline">
              portfolio.dev
            </a>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Joined June 2023</span>
          </div>
        </div>
        <div className="mt-4 flex gap-4">
          <p>
            <span className="font-bold">123</span>{' '}
            <span className="text-muted-foreground">Following</span>
          </p>
          <p>
            <span className="font-bold">456</span>{' '}
            <span className="text-muted-foreground">Followers</span>
          </p>
        </div>
      </div>
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-none border-b border-border bg-transparent">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="replies">Replies</TabsTrigger>
          <TabsTrigger value="endorsements">Endorsements</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {userPosts.length === 0 && (
            <p className="p-4 text-center text-muted-foreground">
              No posts yet.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
