
import { PostCard } from '@/components/post-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAvatar } from '@/components/user-avatar';
import type { User, Post, MedalNomination } from '@/lib/types';
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
  UserCog,
  MessageSquare,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { EditProfileDialog } from '@/components/edit-profile-dialog';
import { CreatePostDialog } from '@/components/create-post-dialog';
import { useParams, useRouter } from 'next/navigation';
import {
  getUserProfile,
  getUserPosts,
  isFollowing,
  getUserNominations,
  hasUserNominatedForModerator,
  getFollowers,
  getFollowing,
} from '@/lib/firestore';
import { toggleFollowAction } from '@/lib/actions/interaction';
import {
  nominateUserForMedalAction,
  nominateUserForModeratorAction,
} from '@/lib/actions/nomination';
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
import { findOrCreateConversationAction } from '@/lib/actions/conversation';
import { FollowListDialog } from '@/components/follow-list-dialog';
import { NominationDialog } from '@/components/nomination-dialog';

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
  const router = useRouter();
  const { user: authUser, fullProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [following, setFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  const [userNominations, setUserNominations] = useState<MedalNomination[]>([]);
  
  const [isNominatingMod, setIsNominatingMod] = useState(false);
  const [hasNominatedMod, setHasNominatedMod] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const userId = params.id;
  const isCurrentUserProfile = authUser?.uid === profileUser?.id;

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoadingProfile(true);
    try {
      const userProfile = await getUserProfile(userId as string);
      setProfileUser(userProfile);
      if (authUser && userProfile && authUser.uid !== userProfile.id) {
        const [isUserFollowing, userHasNominatedForMod, userNoms] =
          await Promise.all([
            isFollowing(authUser.uid, userProfile.id as string),
            hasUserNominatedForModerator(authUser.uid, userProfile.id as string),
            getUserNominations(userProfile.id as string) as Promise<MedalNomination[]>
          ]);
        setFollowing(isUserFollowing);
        setHasNominatedMod(userHasNominatedForMod);
        setUserNominations(userNoms);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoadingProfile(false);
    }
  }, [userId, authUser]);

  const fetchPosts = useCallback(async () => {
    if (!profileUser?.id) return;
    setLoadingPosts(true);
    const userPosts = await getUserPosts(profileUser.id as string, activeTab);
    setPosts(userPosts);
    setLoadingPosts(false);
  }, [profileUser?.id, activeTab]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profileUser) {
        fetchPosts();
    }
  }, [profileUser, fetchPosts]);


  const handleProfileUpdate = (updatedUser: Partial<User>) => {
    setProfileUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
  };

  const handleFollowToggle = async () => {
    if (!authUser || !profileUser || isCurrentUserProfile) return;
    setIsFollowLoading(true);
    try {
      await toggleFollowAction(authUser.uid, profileUser.id, following);
      setFollowing(!following);
      setProfileUser((prev) =>
        prev
          ? { ...prev, followersCount: prev.followersCount + (following ? -1 : 1) }
          : null
      );
    } catch (error) {
      console.error('Failed to toggle follow', error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleNominate = async (medalTitle: string) => {
    if (!authUser || !profileUser) return;
    try {
      await nominateUserForMedalAction(profileUser.id, authUser.uid, medalTitle);
      toast({
        title: 'Nomination successful!',
        description: `${profileUser.name} has been nominated for the "${medalTitle}".`,
      });
      // Refresh nominations to update state
      const userNoms = await getUserNominations(profileUser.id) as MedalNomination[];
      setUserNominations(userNoms);
      setProfileUser((prev) =>
        prev ? { ...prev, nominations: prev.nominations + 1 } : null
      );
    } catch (error: any) {
      toast({
        title: 'Nomination failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleNominateForModerator = async () => {
    if (!authUser || !profileUser) return;
    setIsNominatingMod(true);
    try {
      await nominateUserForModeratorAction(profileUser.id, authUser.uid);
      toast({
        title: 'Moderator Nomination Successful!',
        description: `${profileUser.name} has been nominated for a moderator position.`,
      });
      setHasNominatedMod(true);
      setProfileUser((prev) =>
        prev
          ? {
              ...prev,
              moderatorNominationsCount:
                (prev.moderatorNominationsCount || 0) + 1,
            }
          : null
      );
    } catch (error: any) {
      toast({
        title: 'Moderator nomination failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsNominatingMod(false);
    }
  };

  const handleMessageUser = async () => {
    if (!fullProfile || !profileUser || isCurrentUserProfile) return;
    setIsCreatingConversation(true);
    try {
      const conversationId = await findOrCreateConversationAction(
        fullProfile,
        profileUser
      );
      router.push(`/messages?conversationId=${conversationId}`);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      toast({
        title: 'Error',
        description: 'Could not start a conversation.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  if (loadingProfile || authLoading) {
    return <ProfileSkeleton />;
  }

  if (!profileUser) {
    return <div className="p-4 text-center">User not found.</div>;
  }

  const joinedDate = profileUser.createdAt
    ? new Date(profileUser.createdAt)
    : new Date();

  return (
    <div>
      <div className="relative h-48 bg-muted">
        <Image
          src={
            profileUser.bannerUrl ||
            'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1500&h=500&fit=crop'
          }
          alt="Profile banner"
          fill={true}
          style={{objectFit: "cover"}}
          data-ai-hint="abstract background"
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
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  onClick={handleMessageUser}
                  disabled={isCreatingConversation}
                >
                  {isCreatingConversation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant={following ? 'secondary' : 'default'}
                  className="rounded-full font-bold"
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                >
                  {isFollowLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {following ? 'Following' : 'Follow'}
                </Button>
              </>
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
                <NominationDialog
                    nominatedUserName={profileUser.name}
                    onNominate={handleNominate}
                >
                    <Button
                      variant="outline"
                      className="w-full font-bold"
                    >
                      <Trophy className="mr-2 h-4 w-4 text-amber-500" />
                      Nominate for Medal
                    </Button>
                </NominationDialog>
              )}
              {profileUser.trustScore > 75 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full font-bold"
                      disabled={isNominatingMod || hasNominatedMod}
                    >
                      {isNominatingMod ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <UserCog className="mr-2 h-4 w-4" />
                      )}
                      {hasNominatedMod
                        ? 'Nominated for Mod'
                        : 'Nominate for Moderator'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Nominate {profileUser.name} for Moderator?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will submit {profileUser.name}'s profile to the
                        administrators for moderator consideration. This action
                        is confidential.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleNominateForModerator}
                        disabled={isNominatingMod}
                      >
                        {isNominatingMod && (
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
              <a
                href={profileUser.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {profileUser.website.replace(/^(https?:\/\/)?(www\.)?/, '')}
              </a>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span suppressHydrationWarning>
              Joined {formatDistanceToNow(joinedDate, { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <FollowListDialog
              title="Followers"
              userId={profileUser.id}
              fetchUsers={() => getFollowers(profileUser.id)}
              trigger={
                <span className="cursor-pointer hover:underline">
                  <span className="font-bold text-foreground">
                    {profileUser.followersCount.toLocaleString() || 0}
                  </span>{' '}
                  Followers
                </span>
              }
            />
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <FollowListDialog
              title="Following"
              userId={profileUser.id}
              fetchUsers={() => getFollowing(profileUser.id)}
              trigger={
                <span className="cursor-pointer hover:underline">
                  <span className="font-bold text-foreground">
                    {profileUser.followingCount.toLocaleString() || 0}
                  </span>{' '}
                  Following
                </span>
              }
            />
          </div>
        </div>
      </div>
      <Tabs
        defaultValue="posts"
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 rounded-none border-b border-border bg-transparent">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="endorsements">Endorsements</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab}>
          {loadingPosts ? (
            <div className="p-4">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
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
