'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
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
  approveFlaggedItem,
  removeFlaggedItem,
  getActiveDisputes,
} from '@/lib/firestore';
import type { Post, Dispute, FlaggedContent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    totalEndorsements: 0,
    activeDisputes: 0,
  });
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        userCount,
        reportCount,
        endorsementCount,
        flagged,
        activeDisputes,
      ] = await Promise.all([
        getCollectionCount('users'),
        getCollectionCount('posts', 'type', '==', 'report'),
        getCollectionCount('posts', 'type', '==', 'endorsement'),
        getFlaggedContent(),
        getActiveDisputes(),
      ]);

      setStats({
        totalUsers: userCount,
        totalReports: reportCount,
        totalEndorsements: endorsementCount,
        activeDisputes: activeDisputes.length,
      });
      setFlaggedContent(flagged);
      setDisputes(activeDisputes);
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
      if (user?.uid !== 'user1') {
        router.push('/home');
      } else {
        fetchData();
      }
    }
  }, [user, authLoading, router, fetchData]);

  const handleApprove = async (item: FlaggedContent) => {
    try {
      await approveFlaggedItem(item);
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

  const handleRemove = async (itemId: string) => {
    try {
      await removeFlaggedItem(itemId);
      toast({
        title: 'Content Removed',
        description: 'The flagged content has been deleted.',
        variant: 'destructive',
      });
      fetchData(); // Refresh data
    } catch (error) {
      toast({
        title: 'Removal Failed',
        description: 'Could not remove the content.',
        variant: 'destructive',
      });
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
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold font-headline">Admin Panel</h1>
      </header>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="m-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
        </TabsList>

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
                  <div className="text-2xl font-bold">{stats.activeDisputes}</div>
                </CardContent>
              </Card>
            </section>
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent User Activity</CardTitle>
                  <CardDescription>
                    New user signups over the last 7 days.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UserActivityChart />
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
                  <ContentBreakdownChart />
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
                          {item.postData.text}
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
                            onClick={() => handleRemove(item.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel />
                  Active Disputes ({disputes.length})
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
                    {disputes.map((dispute) => (
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
                {disputes.length === 0 && (
                  <p className="p-4 text-center text-muted-foreground">
                    No active disputes.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
