'use client';

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
import { Gavel, Scale, Users, Vote, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CommentCard } from '@/components/comment-card';
import { Textarea } from '@/components/ui/textarea';
import type { Dispute, Comment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import {
  listenToDispute,
  listenToDisputeComments,
  addDisputeComment,
  castVote,
  getUserProfile,
} from '@/lib/firestore';
import { ModeratorVerdictForm } from '@/components/moderator-verdict-form';

function DisputePageSkeleton() {
    return (
        <div>
            <header className="sticky top-0 z-10 border-b p-4 bg-background/80 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-7 w-64" />
                </div>
            </header>
            <div className="p-4">
                <Card>
                    <CardContent className="space-y-6 pt-6">
                        <Skeleton className="h-20 w-full" />
                        <Separator />
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-40" />
                            <div className="flex gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <Skeleton className="h-12 w-12 rounded-full" />
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                        <Separator />
                        <div className="space-y-4">
                             <Skeleton className="h-6 w-40" />
                             <Skeleton className="h-24 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


export default function DisputePage() {
  const params = useParams<{ id: string }>();
  const { user: authUser, fullProfile } = useAuth();
  const { toast } = useToast();

  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const disputeId = params.id as string;

  useEffect(() => {
    if (!disputeId) return;
    setLoading(true);

    const unsubscribeDispute = listenToDispute(disputeId, (disputeData) => {
        setDispute(disputeData);
        setLoading(false);
    });

    const unsubscribeComments = listenToDisputeComments(disputeId, (commentsData) => {
        setComments(commentsData);
    });

    return () => {
        unsubscribeDispute();
        unsubscribeComments();
    };
  }, [disputeId]);

  const hasVoted = authUser && dispute?.poll.voters?.includes(authUser.uid);
  const totalVotes = dispute?.poll.options.reduce((acc, option) => acc + option.votes, 0) ?? 0;

  const handleVote = async () => {
    if (!selectedOption || !authUser || !dispute) {
      toast({
        title: 'Cannot cast vote',
        description: 'Please select an option and ensure you are logged in.',
        variant: 'destructive',
      });
      return;
    }
    setIsVoting(true);
    try {
        await castVote(dispute.id, dispute.poll, selectedOption, authUser.uid);
        
        // Optimistically update UI to feel responsive
        setDispute(prevDispute => {
            if (!prevDispute) return null;
            const newPoll = { ...prevDispute.poll };
            newPoll.options = newPoll.options.map(opt => 
                opt.text === selectedOption ? { ...opt, votes: opt.votes + 1 } : opt
            );
            if(newPoll.voters) {
                newPoll.voters.push(authUser.uid);
            } else {
                newPoll.voters = [authUser.uid];
            }
            return { ...prevDispute, poll: newPoll };
        });

        toast({
            title: 'Vote Cast!',
            description: `You voted for: "${selectedOption}"`,
        });
    } catch (error) {
        console.error("Failed to cast vote:", error);
        toast({ title: 'Vote Failed', description: 'Could not record your vote.', variant: 'destructive' });
    } finally {
        setIsVoting(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !authUser || !dispute) return;
    setIsSubmittingComment(true);
    try {
        const authorProfile = await getUserProfile(authUser.uid);
        if (!authorProfile) throw new Error("Could not find user profile.");
        await addDisputeComment(dispute.id, newComment, authorProfile);
        setNewComment("");
        // No manual state update needed, the listener will handle it.
    } catch (error) {
        console.error("Failed to add comment:", error);
        toast({ title: 'Comment Failed', description: 'Could not post your comment.', variant: 'destructive' });
    } finally {
        setIsSubmittingComment(false);
    }
  };


  if (loading) {
    return <DisputePageSkeleton />;
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

  const isVotingDisabled = !!hasVoted || dispute.status !== 'voting' || isVoting;

  return (
    <div>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize">
            <Scale className="h-4 w-4" />
            {dispute.status}
          </div>
          <h1 className="truncate text-xl font-bold font-headline">
            {dispute.title}
          </h1>
        </div>
      </header>
      <div className="p-4">
        <Card>
          <CardContent className="space-y-6 pt-6">
            <p className="whitespace-pre-wrap text-lg">{dispute.description}</p>

            <Separator />

            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5" />
                Involved Parties
              </h3>
              <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4">
                {dispute.involvedParties.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <UserAvatar user={user} className="h-12 w-12" />
                    <div>
                      <p className="font-bold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Vote className="h-5 w-5" />
                Community Poll
              </h3>
              <p className="mt-1 text-muted-foreground">
                {dispute.poll.question}
              </p>
              <div className="mt-4 space-y-4">
                {dispute.poll.options.map((option) => {
                  const percentage =
                    totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                  return (
                    <button
                      key={option.text}
                      onClick={() => setSelectedOption(option.text)}
                      disabled={isVotingDisabled}
                      className={cn(
                        'w-full rounded-md border p-4 text-left transition-all',
                        'disabled:cursor-not-allowed disabled:opacity-70',
                        selectedOption === option.text && !isVotingDisabled
                          ? 'border-primary ring-2 ring-primary'
                          : 'border-border',
                        isVotingDisabled ? 'cursor-default' : 'hover:bg-accent/50'
                      )}
                    >
                      <div className="mb-2 flex justify-between font-medium">
                        <span>{option.text}</span>
                        <span>{Math.round(percentage)}%</span>
                      </div>
                      <Progress value={percentage} className="h-3" />
                    </button>
                  );
                })}
              </div>
              {dispute.status === 'voting' && (
                <Button
                  onClick={handleVote}
                  disabled={isVotingDisabled || !selectedOption}
                  className="mt-4 w-full"
                >
                  {isVoting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {hasVoted ? 'Vote Submitted' : 'Cast Your Vote'}
                </Button>
              )}
            </div>

            {dispute.verdict && (
              <>
                <Separator />
                <Alert>
                  <Gavel className="h-4 w-4" />
                  <AlertTitle className="font-headline">
                    Moderator Verdict
                  </AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    <p>{dispute.verdict.decision}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Reasoning:</span>{' '}
                      {dispute.verdict.reason}
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <UserAvatar
                        user={dispute.verdict.moderator as any}
                        className="h-6 w-6"
                      />
                      <span className="text-xs font-semibold">
                        {dispute.verdict.moderator.name}
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>
              </>
            )}

            {fullProfile?.isAdmin && dispute.status !== 'closed' && (
              <>
                <Separator />
                <Card className="mt-6 border-amber-500/50 bg-amber-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-lg">
                      <Gavel className="h-5 w-5" />
                      Moderator Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ModeratorVerdictForm disputeId={dispute.id} onSuccess={() => {}} />
                  </CardContent>
                </Card>
              </>
            )}

            <Separator />

            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                Discussion ({dispute.commentsCount})
              </h3>
              <div className="mt-6 space-y-6">
                <div className="flex gap-4">
                  {authUser ? (
                    <UserAvatar user={authUser} className="h-10 w-10" />
                   ) : (
                    <Skeleton className="h-10 w-10 rounded-full" />
                   )}
                  <div className="flex-1">
                    <Textarea
                      placeholder="Add your comment to the discussion..."
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={!authUser || isSubmittingComment}
                    />
                    <Button className="mt-2" onClick={handleCommentSubmit} disabled={!authUser || isSubmittingComment || !newComment.trim()}>
                      {isSubmittingComment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit Comment
                    </Button>
                  </div>
                </div>
                {comments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
