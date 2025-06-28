'use client';

import { useParams } from 'next/navigation';
import { mockDisputes, mockUsers } from '@/lib/mock-data';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/user-avatar';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Gavel, Scale, Users, Vote } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CommentCard } from '@/components/comment-card';
import { Textarea } from '@/components/ui/textarea';
import type { Poll } from '@/lib/types';

export default function DisputePage() {
  const params = useParams<{ id: string }>();
  const dispute = mockDisputes.find((d) => d.id === params.id);
  const { toast } = useToast();

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [currentPoll, setCurrentPoll] = useState<Poll | undefined>(
    dispute?.poll
  );

  if (!dispute || !currentPoll) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold">Dispute Not Found</h1>
        <p className="text-muted-foreground">
          The dispute you are looking for does not exist or has been removed.
        </p>
      </div>
    );
  }

  const totalVotes = currentPoll.options.reduce(
    (acc, option) => acc + option.votes,
    0
  );

  const handleVote = () => {
    if (!selectedOption) {
      toast({
        title: 'No option selected',
        description: 'Please select an option before casting your vote.',
        variant: 'destructive',
      });
      return;
    }
    setHasVoted(true);

    // Update poll state to reflect the new vote
    setCurrentPoll((prevPoll) => {
      if (!prevPoll) return;
      return {
        ...prevPoll,
        options: prevPoll.options.map((opt) =>
          opt.text === selectedOption ? { ...opt, votes: opt.votes + 1 } : opt
        ),
      };
    });

    toast({
      title: 'Vote Cast!',
      description: `You voted for: "${selectedOption}"`,
    });
  };

  const isVotingDisabled = hasVoted || dispute.status !== 'voting';

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
                {currentPoll.options.map((option) => {
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
                        user={dispute.verdict.moderator}
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

            <Separator />

            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                Discussion ({dispute.comments?.length || 0})
              </h3>
              <div className="mt-6 space-y-6">
                <div className="flex gap-4">
                  <UserAvatar user={mockUsers.user1} className="h-10 w-10" />
                  <div className="flex-1">
                    <Textarea
                      placeholder="Add your comment to the discussion..."
                      rows={3}
                    />
                    <Button className="mt-2">Submit Comment</Button>
                  </div>
                </div>
                {dispute.comments?.map((comment) => (
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
