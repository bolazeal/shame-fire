'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { mockDisputes } from '@/lib/mock-data';
import {
  AlertCircle,
  CheckCircle,
  FileWarning,
  Gavel,
  Shield,
  Trash2,
  View,
} from 'lucide-react';
import Link from 'next/link';
import { useModeration } from '@/hooks/use-moderation';

export default function ModerationPage() {
  const { flaggedContent, dismissFlaggedItem, removeFlaggedItem } =
    useModeration();

  const handleDismiss = (id: string) => {
    dismissFlaggedItem(id);
  };

  const handleRemove = (id: string) => {
    removeFlaggedItem(id);
  };

  const activeDisputes = mockDisputes.filter((d) => d.status !== 'closed');

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold font-headline">Moderator Dashboard</h1>
      </header>

      <div className="space-y-8 p-4">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Items for Review
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{flaggedContent.length}</div>
              <p className="text-xs text-muted-foreground">
                Content flagged by AI or users
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
              <div className="text-2xl font-bold">{activeDisputes.length}</div>
              <p className="text-xs text-muted-foreground">
                Cases currently in the Village Square
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Moderator Activity
              </CardTitle>
              <FileWarning className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12</div>
              <p className="text-xs text-muted-foreground">
                Actions taken in the last 7 days
              </p>
            </CardContent>
          </Card>
        </section>

        <Tabs defaultValue="flagged-content">
          <TabsList>
            <TabsTrigger value="flagged-content">Flagged Content</TabsTrigger>
            <TabsTrigger value="active-disputes">Active Disputes</TabsTrigger>
          </TabsList>
          <TabsContent value="flagged-content">
            <Card>
              <CardHeader>
                <CardTitle>Content Review Queue</CardTitle>
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
                            onClick={() => handleDismiss(item.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Dismiss
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
          </TabsContent>
          <TabsContent value="active-disputes">
            <Card>
              <CardHeader>
                <CardTitle>Active Disputes</CardTitle>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
