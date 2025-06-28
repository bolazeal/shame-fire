import type { Dispute } from '@/lib/types';
import { UserAvatar } from './user-avatar';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Gavel, MessageCircle, Scale, Users } from 'lucide-react';
import { Separator } from './ui/separator';

interface DisputeCardProps {
  dispute: Dispute;
}

export function DisputeCard({ dispute }: DisputeCardProps) {
  const totalVotes = dispute.poll.options.reduce(
    (acc, option) => acc + option.votes,
    0
  );

  return (
    <div className="border-b p-4 transition-colors hover:bg-accent/10">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-xl">
                {dispute.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Dispute opened on {dispute.createdAt}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize">
              <Scale className="h-4 w-4" />
              {dispute.status}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="whitespace-pre-wrap text-base">{dispute.description}</p>
          
          <Separator />
          
          <div>
            <h4 className="flex items-center gap-2 font-semibold">
              <Users className="h-5 w-5" />
              Involved Parties
            </h4>
            <div className="mt-2 flex items-center gap-8">
              {dispute.involvedParties.map((user) => (
                <div key={user.id} className="flex items-center gap-2">
                  <UserAvatar user={user} className="h-10 w-10" />
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />

          <div>
            <h4 className="font-semibold">{dispute.poll.question}</h4>
            <div className="mt-3 space-y-3">
              {dispute.poll.options.map((option) => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                return (
                  <div key={option.text}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{option.text}</span>
                      <span className="text-muted-foreground">
                        {Math.round(percentage)}% ({option.votes} votes)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>

          {dispute.verdict && (
            <>
            <Separator />
            <Alert>
              <Gavel className="h-4 w-4" />
              <AlertTitle className="font-headline">Moderator Verdict</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>{dispute.verdict.decision}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold">Reasoning:</span> {dispute.verdict.reason}
                </p>
                 <div className="flex items-center gap-2 pt-2">
                  <UserAvatar user={dispute.verdict.moderator} className="h-6 w-6" />
                  <span className="text-xs font-semibold">{dispute.verdict.moderator.name}</span>
                </div>
              </AlertDescription>
            </Alert>
            </>
          )}
          
          <Separator />

          <div className="flex items-center justify-between text-muted-foreground">
             <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 rounded-full hover:text-primary"
            >
              <MessageCircle className="h-5 w-5" />
              <span>View {dispute.commentsCount} Comments</span>
            </Button>
            {dispute.status === 'voting' && <Button>Cast Your Vote</Button>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
