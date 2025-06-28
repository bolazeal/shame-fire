'use client';

import { PostCard } from '@/components/post-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/user-avatar';
import { mockPosts, mockUsers } from '@/lib/mock-data';
import type { User } from '@/lib/types';
import {
  Calendar,
  Flag,
  Link as LinkIcon,
  MapPin,
  ShieldCheck,
  ThumbsUp,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { EditProfileDialog } from '@/components/edit-profile-dialog';
import { CreatePostDialog } from '@/components/create-post-dialog';

export default function ProfilePage({ params }: { params: { id: string } }) {
  const user =
    Object.values(mockUsers).find((u) => u.id === params.id) ||
    mockUsers.user1;

  const userPostsAll = mockPosts.filter((p) => p.author.id === user.id);
  const userPosts = userPostsAll.filter((p) => p.type === 'post');
  const userReports = userPostsAll.filter((p) => p.type === 'report');
  const userEndorsements = userPostsAll.filter((p) => p.type === 'endorsement');
  const userMediaPosts = userPostsAll.filter((p) => p.mediaUrl);


  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  const handleProfileUpdate = (updatedUser: Partial<User>) => {
    // In a real app, this would be a PATCH request to an API
    // For now, we just update the local state to see changes reflected
    setCurrentUser((prev) => ({ ...prev, ...updatedUser }));
  };

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
            user={currentUser}
            className="-mt-20 h-32 w-32 border-4 border-background"
          />
          <div className="flex items-center gap-2">
            {params.id === 'user1' ? ( // Assuming 'user1' is the logged-in user
              <EditProfileDialog
                user={currentUser}
                onProfileUpdate={handleProfileUpdate}
              >
                <Button variant="outline" className="rounded-full font-bold">
                  Edit profile
                </Button>
              </EditProfileDialog>
            ) : (
              <Button
                variant={isFollowing ? 'secondary' : 'outline'}
                className="rounded-full font-bold"
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>
        <div className="mt-2">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold font-headline">
                {currentUser.name}
              </h2>
              {currentUser.isVerified && (
                <ShieldCheck className="h-6 w-6 text-primary" />
              )}
            </div>
            {params.id !== 'user1' && (
              <div className="flex items-center gap-2">
                <CreatePostDialog
                  dialogTitle={`Endorse ${currentUser.name}`}
                  initialValues={{
                    type: 'endorsement',
                    entity: currentUser.name,
                  }}
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full font-bold"
                    >
                      <ThumbsUp /> Endorse
                    </Button>
                  }
                />
                <CreatePostDialog
                  dialogTitle={`Report ${currentUser.name}`}
                  initialValues={{ type: 'report', entity: currentUser.name }}
                  trigger={
                    <Button
                      variant="destructive"
                      size="sm"
                      className="rounded-full font-bold"
                    >
                      <Flag /> Report
                    </Button>
                  }
                />
              </div>
            )}
          </div>

          <p className="text-muted-foreground">@{currentUser.username}</p>
        </div>
        <div className="mt-4 text-base">
          <p>{currentUser.bio}</p>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="font-headline text-lg">
              Trust Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-primary">
                {currentUser.trustScore}
              </span>
              <div className="flex-1">
                <Progress value={currentUser.trustScore} className="h-3" />
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

      </div>
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-none border-b border-border bg-transparent">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
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
        <TabsContent value="reports">
          {userReports.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {userReports.length === 0 && (
            <p className="p-4 text-center text-muted-foreground">
              No reports yet.
            </p>
          )}
        </TabsContent>
        <TabsContent value="endorsements">
          {userEndorsements.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {userEndorsements.length === 0 && (
            <p className="p-4 text-center text-muted-foreground">
              No endorsements yet.
            </p>
          )}
        </TabsContent>
        <TabsContent value="media">
          {userMediaPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {userMediaPosts.length === 0 && (
            <p className="p-4 text-center text-muted-foreground">
              This user hasn't posted any media.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
