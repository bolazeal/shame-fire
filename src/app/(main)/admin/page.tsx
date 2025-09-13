

'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertCircle,
  FileText,
  Gavel,
  Shield,
  ThumbsUp,
  Users,
  CheckCircle,
  Trash2,
  View,
  Loader2,
  Settings,
  MoreHorizontal,
  UserCheck,
  UserX,
  Ban,
  RotateCcw,
  UserCog,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserActivityChart } from '@/components/charts/user-activity-chart';
import { ContentBreakdownChart } from '@/components/charts/content-breakdown-chart';
import {
  getCollectionCount,
  getFlaggedContent,
  getAllDisputes,
  getAllUsers,
} from '@/lib/firestore';
import { approvePostAction } from '@/lib/actions/post';
import type { Post, Dispute, FlaggedContent, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { UserAvatar } from '@/components/user-avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toggleAdminStatusAction, updateUserAccountStatusAction, resetUserTrustScoreAction, removeFlaggedItemAction, deletePostAndFlagsAction } from '@/lib/actions/admin';
import { SettingsForm } from '@/components/settings-form';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function AdminPage() {
  const { fullProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalReports: 0,
    totalEndorsements: 0,
    activeDisputes: 0,
  });
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [allDisputes, setAllDisputes] = useState<Dispute[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [updatingTrustScore, setUpdatingTrustScore] = useState<string | null>(
    null
  );
  const [updatingAdminId, setUpdatingAdminId] = useState<string | null>(null);
  
  const [contentBreakdownData, setContentBreakdownData] = useState<any[]>([]);
  const [userActivityData, setUserActivityData] = useState<any[]>([]);

  const activeDisputes = useMemo(
    () => allDisputes.filter((d) => d.status !== 'closed'),
    [allDisputes]
  );
  const closedDisputes = useMemo(
    () => allDisputes.filter((d) => d.status === 'closed'),
    [allDisputes]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        userCount,
        postCount,
        reportCount,
        endorsementCount,
        flagged,
        disputesData,
        usersData,
      ] = await Promise.all([
        getCollectionCount('users'),
        getCollectionCount('posts', 'type', '==', 'post'),
        getCollectionCount('posts', 'type', '==', 'report'),
        getCollectionCount('posts', 'type', '==', 'endorsement'),
        getFlaggedContent(),
        getAllDisputes(),
        getAllUsers(),
      ]);

      const newStats = {
        totalUsers: userCount,
        totalPosts: postCount,
        totalReports: reportCount,
        totalEndorsements: endorsementCount,
        activeDisputes: disputesData.filter((d) => d.status !== 'closed').length,
      };

      setStats(newStats);
      setContentBreakdownData([
        { type: 'posts', count: newStats.totalPosts },
        { type: 'reports', count: newStats.totalReports },
        { type: 'endorsements', count: newStats.totalEndorsements },
      ]);
      
      const processUserActivity = (users: User[]) => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            return d;
        }).reverse(); 

        const dailySignups = last7Days.map(day => ({
            date: day.toLocaleDateString('en-US', { weekday: 'short' }),
            signups: 0
        }));

        users.forEach(user => {
            if (user.createdAt) {
                const signupDate = new Date(user.createdAt);
                signupDate.setHours(0,0,0,0);
                
                const diffTime = new Date().setHours(0,0,0,0) - signupDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays >= 0 && diffDays < 7) {
                    const dayIndex = 6 - diffDays;
                    if(dailySignups[dayIndex]) {
                        dailySignups[dayIndex].signups++;
                    }
                }
            }
        });
        return dailySignups;
    };
    
      setUserActivityData(processUserActivity(usersData));

      setFlaggedContent(flagged);
      setAllDisputes(disputesData);
      setAllUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin panel data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!authLoading) {
      if (!fullProfile?.isAdmin) {
        router.push('/home');
      } else {
        fetchData();
      }
    }
  }, [fullProfile, authLoading, router, fetchData]);

  const handleApprove = async (item: FlaggedContent) => {
    try {
      if (!item.postData) {
        toast({
          title: 'Invalid Action',
          description:
            'This is a flag on an existing post and cannot be "approved". Use "Dismiss" instead.',
          variant: 'destructive',
        });
        return;
      }
      await approvePostAction(item);
      toast({
        title: 'Content Approved',
        description: 'The content has been posted successfully.',
      });
      fetchData(); // Refresh data
    } catch (error) {
      toast({
        title: 'Approval Failed',
        description: 'Could not approve the content.',
        variant: 'destructive',
      });
    }
  };

  const handleRemove = async (item: FlaggedContent) => {
    try {
      if (item.postId) {
        // This is a flag on an existing post. "Remove" means delete the original post.
        await deletePostAndFlagsAction(item.postId);
        toast({
          title: 'Post Removed',
          description:
            'The original post and all its flags have been deleted.',
          variant: 'destructive',
        });
      } else {
        // This is a flag on content held before creation. "Remove" means just delete the flag.
        await removeFlaggedItemAction(item.id);
        toast({
          title: 'Content Removed',
          description: 'The flagged content has been deleted from the queue.',
          variant: 'destructive',
        });
      }
      fetchData(); // Refresh data
    } catch (error) {
      toast({
        title: 'Removal Failed',
        description: 'Could not remove the content.',
        variant: 'destructive',
      });
    }
  };

  const handleDismissFlag = async (flaggedItemId: string) => {
    try {
      await removeFlaggedItemAction(flaggedItemId);
      toast({
        title: 'Flag Dismissed',
        description: 'The flag has been removed, the original post remains.',
      });
      fetchData(); // Refresh data
    } catch (error) {
      toast({
        title: 'Dismissal Failed',
        description: 'Could not dismiss the flag.',
        variant: 'destructive',
      });
    }
  };


  const handleUpdateUserStatus = async (
    userId: string,
    status: 'active' | 'suspended' | 'banned'
  ) => {
    setUpdatingUserId(userId);
    try {
      await updateUserAccountStatusAction(userId, status);
      toast({
        title: 'User Status Updated',
        description: `User has been set to ${status}.`,
      });
      fetchData(); // Refresh the user list
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast({
        title: 'Error',
        description: 'Could not update user status.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleResetTrustScore = async (userId: string) => {
    setUpdatingTrustScore(userId);
    try {
      await resetUserTrustScoreAction(userId);
      toast({
        title: 'Trust Score Reset',
        description: `User's trust score has been reset to 50.`,
      });
      fetchData(); // Refresh the user list
    } catch (error) {
      console.error('Failed to reset trust score:', error);
      toast({
        title: 'Error',
        description: 'Could not reset trust score.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingTrustScore(null);
    }
  };

  const handleToggleAdminStatus = async (userToUpdate: User) => {
    if (!fullProfile) return;
    setUpdatingAdminId(userToUpdate.id);
    try {
      await toggleAdminStatusAction(userToUpdate.id);
      toast({
        title: 'Success',
        description: `${userToUpdate.name} is ${
          userToUpdate.isAdmin ? 'no longer' : 'now'
        } an admin.`,
      });
      fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not update admin status.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingAdminId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div>
        <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-40" />
        </header>
        <div className="space-y-8 p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
          <Skeleton className="h-10 w-48" />
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold font-headline">Admin Panel</h1>
      </header>

      <Tabs defaultValue="dashboard" className="w-full">
        <div className="mx-4 mb-8">
            <ScrollArea className="w-full whitespace-nowrap rounded-lg">
                <TabsList className="w-max">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="disputes">Dispute Management</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>


        <TabsContent value="dashboard" className="m-0 border-t">
          <div className="space-y-8 p-4">
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Reports
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalReports}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Endorsements
                  </CardTitle>
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalEndorsements}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Disputes
                  </CardTitle>
                  <Gavel className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.activeDisputes}
                  </div>
                </CardContent>
              </Card>
            </section>
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>Recent User Activity</CardTitle>
                  <CardDescription>
                    New user signups over the last 7 days.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserActivityChart data={userActivityData} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Content Breakdown</CardTitle>
                  <CardDescription>
                    A summary of all content types on the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContentBreakdownChart data={contentBreakdownData} />
                </CardContent>
              </Card>
            </section>
          </div>
        </TabsContent>
        <TabsContent value="moderation" className="m-0 border-t">
          <div className="space-y-8 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle />
                  Content Review Queue ({flaggedContent.length})
                </CardTitle>
                <CardDescription>
                  Review content flagged by AI for policy violations. Approve to
                  post, or remove.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flaggedContent.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-xs truncate font-mono text-xs">
                          {item.postText || item.postData?.text}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/profile/${item.author.id}`}
                            className="hover:underline"
                          >
                            {item.author.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{item.reason}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.postId ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDismissFlag(item.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Dismiss Flag
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemove(item)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Post
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(item)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemove(item)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {flaggedContent.length === 0 && (
                  <p className="p-4 text-center text-muted-foreground">
                    The review queue is empty. Great job!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="m-0 border-t">
          <div className="space-y-8 p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users />
                  User Management ({allUsers.length})
                </CardTitle>
                <CardDescription>
                  View, manage, and take action on user accounts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Trust Score
                      </TableHead>
                       <TableHead className="hidden text-center sm:table-cell">
                        Mod Nominations
                       </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Link
                            href={`/profile/${user.id}`}
                            className="font-medium hover:underline"
                          >
                            {user.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            @{user.username}
                          </p>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {user.email}
                        </TableCell>
                        <TableCell className="hidden text-center sm:table-cell">
                          {user.trustScore}
                        </TableCell>
                        <TableCell className="hidden text-center sm:table-cell">
                            <Tooltip>
                                <TooltipTrigger>
                                <div className="flex items-center justify-center gap-1">
                                    <UserCog className="h-4 w-4"/>
                                    <span>{user.moderatorNominationsCount || 0}</span>
                                </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Moderator Nominations</p>
                                </TooltipContent>
                            </Tooltip>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1">
                            <Badge
                              variant={
                                user.accountStatus === 'active'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className="capitalize"
                            >
                              {user.accountStatus}
                            </Badge>
                            {user.isAdmin && (
                              <Badge variant="destructive">Admin</Badge>
                            )}
                            {user.isVerified && (
                              <Badge variant="secondary">Verified</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={
                                  updatingUserId === user.id ||
                                  updatingTrustScore === user.id ||
                                  updatingAdminId === user.id
                                }
                              >
                                {updatingUserId === user.id ||
                                updatingTrustScore === user.id ||
                                updatingAdminId === user.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {user.accountStatus !== 'active' && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateUserStatus(user.id, 'active')
                                  }
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Reactivate
                                </DropdownMenuItem>
                              )}

                              {user.accountStatus === 'active' && !user.isAdmin && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateUserStatus(
                                      user.id,
                                      'suspended'
                                    )
                                  }
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Suspend
                                </DropdownMenuItem>
                              )}

                              {user.accountStatus !== 'banned' && !user.isAdmin && (
                                <DropdownMenuItem
                                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                  onClick={() =>
                                    handleUpdateUserStatus(user.id, 'banned')
                                  }
                                >
                                  <Ban className="mr-2 h-4 w-4" />
                                  Ban
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleToggleAdminStatus(user)}
                                  disabled={fullProfile?.id === user.id}
                                >
                                  <UserCog className="mr-2 h-4 w-4" />
                                  {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                  >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset Trust Score
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will reset @{user.username}&apos;s
                                      trust score to the default value of 50.
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleResetTrustScore(user.id)
                                      }
                                      disabled={updatingTrustScore === user.id}
                                    >
                                      {updatingTrustScore === user.id && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      )}
                                      Confirm Reset
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="disputes" className="m-0 border-t">
          <div className="p-4">
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">
                  Active ({activeDisputes.length})
                </TabsTrigger>
                <TabsTrigger value="closed">
                  Closed ({closedDisputes.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="active" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gavel />
                      Active Disputes
                    </CardTitle>
                    <CardDescription>
                      Oversee ongoing disputes in the Village Square.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dispute Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Involved Parties</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeDisputes.map((dispute) => (
                          <TableRow key={dispute.id}>
                            <TableCell className="font-medium">
                              {dispute.title}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {dispute.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {dispute.involvedParties
                                .map((p) => p.name)
                                .join(', ')}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/dispute/${dispute.id}`}>
                                  <View className="mr-2 h-4 w-4" />
                                  View Dispute
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {activeDisputes.length === 0 && (
                      <p className="p-4 text-center text-muted-foreground">
                        No active disputes.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="closed" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle />
                      Closed Disputes
                    </CardTitle>
                    <CardDescription>
                      Review the history of resolved disputes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dispute Title</TableHead>
                          <TableHead>Verdict By</TableHead>
                          <TableHead>Decision</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {closedDisputes.map((dispute) => (
                          <TableRow key={dispute.id}>
                            <TableCell className="font-medium">
                              {dispute.title}
                            </TableCell>
                            <TableCell>
                              {dispute.verdict ? (
                                <div className="flex items-center gap-2">
                                  <UserAvatar
                                    user={dispute.verdict.moderator as any}
                                    className="h-8 w-8"
                                  />
                                  <div>
                                    <p className="font-bold">{dispute.verdict.moderator.name}</p>
                                    <p className="text-xs text-muted-foreground">Moderator</p>
                                  </div>
                                </div>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs truncate text-muted-foreground">
                              {dispute.verdict?.decision}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/dispute/${dispute.id}`}>
                                  <View className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {closedDisputes.length === 0 && (
                      <p className="p-4 text-center text-muted-foreground">
                        No closed disputes yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="m-0 border-t">
          <div className="p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings />
                  Platform Settings
                </CardTitle>
                <CardDescription>
                  Configure global aspects of the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsForm />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </TooltipProvider>
  );
}
