'use client';

import type { Comment } from '@/lib/types';
import { UserAvatar } from './user-avatar';
import { Button } from './ui/button';
import { ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentCardProps {
  comment: Comment;
  isReply?: boolean;
}

export function CommentCard({ comment, isReply = false }: CommentCardProps) {
  const commentDate = comment.createdAt ? new Date(comment.createdAt) : new Date();

  return (
    <div className={`flex gap-4 ${isReply ? 'ml-12' : ''}`}>
      <UserAvatar user={comment.author} className="h-10 w-10" />
      <div className="flex-1">
        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-bold">{comment.author.name}</span>
            <span className="text-muted-foreground">
              @{comment.author.username}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{formatDistanceToNow(commentDate, { addSuffix: true })}</span>
          </div>
          <p className="mt-2 text-base">{comment.text}</p>
        </div>
        <div className="mt-2 flex items-center gap-2 text-muted-foreground">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{comment.upvotes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <ThumbsDown className="h-4 w-4" />
            <span>{comment.downvotes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>Reply</span>
          </Button>
        </div>
        {/* Reply functionality to be implemented */}
      </div>
    </div>
  );
}
