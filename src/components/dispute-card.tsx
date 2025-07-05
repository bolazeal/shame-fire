'use client';

import type { Dispute } from '@/lib/types';
import { UserAvatar } from './user-avatar';
import { Progress } from './ui/progress';
import { Gavel, MessageCircle, Scale } from 'lucide-react';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface DisputeCardProps {
  dispute: Dispute;
}

export function DisputeCard({ dispute }: DisputeCardProps) {
  const totalVotes = dispute.poll.options.reduce(
    (acc, option) => acc + option.votes,
    0
  );
  
  const disputeDate = new Date(dispute.createdAt);

  return (
    <Link
      href={`/dispute/${dispute.id}`}
      className="block border-b transition-colors last:border-b-0 hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <article className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize">
              <Scale className="h-4 w-4" />
              {dispute.status}
            </div>
            <h2 className="mt-2 font-headline text-xl">{dispute.title}</h2>
            <p className="text-sm text-muted-foreground" suppressHydrationWarning>
              Dispute opened {formatDistanceToNow(disputeDate, { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <p className="line-clamp-3 whitespace-pre-wrap text-base">
            {dispute.description}
          </p>

          <div>
            <div className="mt-2 flex -space-x-2 overflow-hidden">
                {dispute.involvedParties.map((user) => (
                    <UserAvatar key={user.id} user={user} className="h-8 w-8 border-2 border-background" />
                ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold">{dispute.poll.question}</h4>
            <div className="mt-2 space-y-2">
              {dispute.poll.options.map((option) => {
                const percentage =
                  totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
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

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="font-medium text-primary">
                {dispute.commentsCount} Comments
              </span>
            </div>
            {dispute.status === 'voting' && (
              <Badge variant="outline">Voting Open</Badge>
            )}
            {dispute.status === 'closed' && (
              <Badge variant="secondary">Case Closed</Badge>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
