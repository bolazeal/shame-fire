
'use server';

import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/user-avatar';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Gavel, Scale, Users, Vote, Loader2, MessageSquare, ShieldCheck, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommentCard } from '@/components/comment-card';
import { Textarea } from '@/components/ui/textarea';
import type { Dispute, Comment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  listenToDispute,
  listenToDisputeComments,
  getDispute,
  getDisputeComments
} from '@/lib/firestore';
import { ModeratorVerdictForm } from '@/components/moderator-verdict-form';
import Link from 'next/link';
import { DisputePageClient } from '@/components/dispute-page-client';

export default async function DisputePage({ params }: { params: { id: string }}) {
  const disputeId = params.id as string;

  let dispute: Dispute | null = null;
  let comments: Comment[] = [];

  try {
      [dispute, comments] = await Promise.all([
          getDispute(disputeId),
          getDisputeComments(disputeId)
      ]);
  } catch (error) {
      console.error("Failed to fetch dispute and comments", error);
  }

  if (!dispute) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold">Dispute Not Found</h1>
        <p className="text-muted-foreground">
          The dispute you are looking for does not exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <DisputePageClient initialDispute={dispute} initialComments={comments} />
  );
}
