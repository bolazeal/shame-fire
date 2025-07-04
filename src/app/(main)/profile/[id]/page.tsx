
'use client';

import { PostCard } from '@/components/post-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/user-avatar';
import type { User, Post } from '@/lib/types';
import {
  Calendar,
  Flag,
  Link as LinkIcon,
  MapPin,
  ShieldCheck,
  ThumbsUp,
  Trophy,
  Users,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { EditProfileDialog } from '@/components/edit-profile-dialog';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { useParams } from 'next/navigation';
import {
  getUserProfile,
  getUserPosts,
  isFollowing,
  toggleFollow,
  nominateUserForMedal,
} from '@/lib/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

function ProfileSkeleton() {
  return (
    <div>
      <Skeleton className="h-48 w-full bg-muted" />
      <div className="p-4">
        <div className="flex justify-between">
          <Skeleton className="-mt-20 h-32 w-32 rounded-full border-4 border-background" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
        <div className="mt-2 space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="mt-4 h-12 w-full" />
        <div className="mt-4 grid flex-1 grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}


export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const { user: authUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [following, setFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isNominating, setIsNominating] = useState(false);
  const [hasNominated, setHasNominated] = useState(false);


  const userId = params.id;
  const isCurrentUserProfile = authUser?.uid === userId;

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoadingProfile(true);
    try {
        const userProfile = await getUserProfile(userId as string);
        setProfileUser(userProfile);
        if (authUser && authUser.uid !== userId) {
          const isUserFollowing = await isFollowing(authUser.uid, userId as string);
          setFollowing(isUserFollowing);
        }
    } catch (error) {
        console.error("Failed to fetch profile", error);
    } finally {
        setLoadingProfile(false);
    }
  }, [userId, authUser]);

  const fetchPosts = useCallback(async () => {
    if (!userId) return;
    setLoadingPosts(true);
    const userPosts = await getUserPosts(userId as string, activeTab);
    setPosts(userPosts);
    setLoadingPosts(false);
  }, [userId, activeTab]);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [fetchProfile, fetchPosts]);

  const handleProfileUpdate = (updatedUser: Partial<User>) => {
    setProfileUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
  };
  
  const handleFollowToggle = async () => {
      if (!authUser || !profileUser || isCurrentUserProfile) return;
      setIsFollowLoading(true);
      try {
          await toggleFollow(authUser.uid, profileUser.id, following);
          setFollowing(!following);
          setProfileUser(prev => prev ? { ...prev, followersCount: prev.followersCount + (following ? -1 : 1) } : null);
      } catch (error) {
          console.error("Failed to toggle follow", error);
      } finally {
          setIsFollowLoading(false);
      }
  };

  const handleNominate = async () => {
    if (!authUser || !profileUser) return;
    setIsNominating(true);
    try {
      await nominateUserForMedal(profileUser.id, authUser.uid);
      toast({
        title: 'Nomination successful!',
        description: `${profileUser.name} has been nominated for a Medal of Honour.`,
      });
      setHasNominated(true);
      setProfileUser((prev) =>
        prev ? { ...prev, nominations: prev.nominations + 1 } : null
      );
    } catch (error: any) {
      toast({
        title: 'Nomination failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsNominating(false);
    }
  };


  if (loadingProfile || authLoading) {
    return <ProfileSkeleton />;
  }

  if (!profileUser) {
    return <div className="p-4 text-center">User not found.</div>;
  }
  
  const joinedDate = profileUser.createdAt ? new Date(profileUser.createdAt) : new Date();

  return (
    <div>
      <div className="relative h-48 bg-muted">
        <Image
          src={profileUser.bannerUrl || "https://placehold.co/1500x500.png"}
          alt="Profile banner"
          fill={true}
          objectFit="cover"
          data-ai-hint="abstract landscape"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between">
          <UserAvatar
            user={profileUser}
            className="-mt-20 h-32 w-32 border-4 border-background"
          />
          <div className="flex items-center gap-2">
            {isCurrentUserProfile ? (
              <EditProfileDialog
                user={profileUser}
                onProfileUpdate={handleProfileUpdate}
              >
                <Button variant="outline" className="rounded-full font-bold">
                  Edit profile
                </Button>
              </EditProfileDialog>
            ) : (
              <Button
                variant={following ? 'secondary' : 'outline'}
                className="rounded-full font-bold"
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
              >
                 {isFollowLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {following ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>
        <div className="mt-2">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold font-headline">
                {profileUser.name}
              </h2>
              {profileUser.isVerified && (
                <ShieldCheck className="h-6 w-6 text-primary" />
              )}
            </div>
          </div>

          <p className="text-muted-foreground">@{profileUser.username}</p>
        </div>
        <div className="mt-4 text-base">
          <p>{profileUser.bio}</p>
        </div>

        <div className="mt-4 flex flex-wrap items-stretch gap-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="font-headline text-lg">
                Trust Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-primary">
                  {profileUser.trustScore}
                </span>
                <div className="flex-1">
                  <Progress value={profileUser.trustScore} className="h-3" />
                  <p className="mt-1 text-sm text-muted-foreground">
                    Based on community endorsements and reports.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {!isCurrentUserProfile && (
            <div className="flex shrink-0 flex-col justify-center gap-2">
                <CreatePostDialog
                  dialogTitle={`Endorse ${profileUser.name}`}
                  initialValues={{
                    type: 'endorsement',
                    entity: profileUser.name,
                  }}
                  trigger={
                    <Button variant="outline" className="w-full font-bold">
                      <ThumbsUp className="mr-2 h-4 w-4" /> Endorse
                    </Button>
                  }
                />
                <CreatePostDialog
                  dialogTitle={`Report ${profileUser.name}`}
                  initialValues={{ type: 'report', entity: profileUser.name }}
                  trigger={
                    <Button variant="destructive" className="w-full font-bold">
                      <Flag className="mr-2 h-4 w-4" /> Report
                    </Button>
                  }
                />
                {profileUser.trustScore > 80 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full font-bold"
                        disabled={hasNominated}
                      >
                        <Trophy className="mr-2 h-4 w-4 text-amber-500" />
                        {hasNominated ? 'Nominated' : 'Nominate for Medal'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Nominate {profileUser.name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will formally nominate {profileUser.name} for a
                          Medal of Honour, recognizing their positive impact.
                          This action is public and cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleNominate}
                          disabled={isNominating}
                        >
                          {isNominating && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Confirm Nomination
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
          {profileUser.location && (
            <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{profileUser.location}</span>
            </div>
          )}
          {profileUser.website && (
            <div className="flex items-center gap-1">
                <LinkIcon className="h-4 w-4" />
                <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {profileUser.website.replace(/^(https?:\/\/)?(www\.)?/, '')}
                </a>
            </div>
           )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Joined {formatDistanceToNow(joinedDate, { addSuffix: true })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>
              <span className="font-bold text-foreground">
                {profileUser.followersCount.toLocaleString() || 0}
              </span>{' '}
              Followers
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>
              <span className="font-bold text-foreground">
                {profileUser.followingCount.toLocaleString() || 0}
              </span>{' '}
              Following
            </span>
          </div>
        </div>
      </div>
      <Tabs defaultValue="posts" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-none border-b border-border bg-transparent">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="endorsements">Endorsements</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
          {loadingPosts ? (
             <div className="p-4"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <p className="p-4 text-center text-muted-foreground">
              No {activeTab} yet.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
