
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { mockUsers, mockPosts, mockDisputes } from '@/lib/mock-data';
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
import { useModeration } from '@/hooks/use-moderation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserActivityChart } from '@/components/charts/user-activity-chart';
import { ContentBreakdownChart } from '@/components/charts/content-breakdown-chart';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const { flaggedContent, dismissFlaggedItem, removeFlaggedItem } =
    useModeration();

  useEffect(() => {
    // In a real app, you'd check a user's role from a database.
    // For this demo, we'll hardcode the admin user's ID.
    if (!loading && user?.uid !== 'user1') {
      router.push('/home');
    }
  }, [user, loading, router]);

  const totalUsers = Object.keys(mockUsers).length;
  const totalReports = mockPosts.filter((p) => p.type === 'report').length;
  const totalEndorsements = mockPosts.filter(
    (p) => p.type === 'endorsement'
  ).length;
  const activeDisputes = mockDisputes.filter((d) => d.status !== 'closed');

  if (loading || user?.uid !== 'user1') {
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
                  <div className="text-2xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 new users this month
                  </p>
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
                  <div className="text-2xl font-bold">{totalReports}</div>
                  <p className="text-xs text-muted-foreground">
                    -5 from last month
                  </p>
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
                  <div className="text-2xl font-bold">{totalEndorsements}</div>
                  <p className="text-xs text-muted-foreground">
                    +15 from last month
                  </p>
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
                    {activeDisputes.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently in the Village Square
                  </p>
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
                  Review content flagged by AI and users for policy violations.
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
                        <TableCell className="max-w-xs truncate italic">
                          "{item.content}"
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
                            onClick={() => dismissFlaggedItem(item.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Dismiss
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFlaggedItem(item.id)}
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
                  Active Disputes ({activeDisputes.length})
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
                          {dispute.involvedParties.map((p) => p.name).join(', ')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dispute/${dispute.id}`} passHref>
                            <Button variant="outline" size="sm">
                              <View className="mr-2 h-4 w-4" />
                              View Dispute
                            </Button>
                          </Link>
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
