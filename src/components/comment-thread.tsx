
'use client';

import type { Comment } from '@/lib/types';
import { CommentCard } from './comment-card';

interface CommentThreadProps {
  comment: Comment & { replies: (Comment & {replies: any[]})[] };
  postId: string;
  postAuthorId: string;
  onDelete: (commentId: string) => Promise<void>;
  onReplySuccess: () => void;
  isThreadView?: boolean;
}

export function CommentThread({ comment, postId, postAuthorId, onDelete, onReplySuccess, isThreadView = false }: CommentThreadProps) {
  return (
    <div className="flex flex-col gap-4">
      <CommentCard
        comment={comment}
        postId={postId}
        postAuthorId={postAuthorId}
        onDelete={onDelete}
        onReplySuccess={onReplySuccess}
        isThreadView={isThreadView}
      />
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 border-l-2 border-border pl-4">
          {comment.replies.map(reply => (
            <CommentThread
              key={reply.id}
              comment={reply}
              postId={postId}
              postAuthorId={postAuthorId}
              onDelete={onDelete}
              onReplySuccess={onReplySuccess}
              isThreadView={isThreadView}
            />
          ))}
        </div>
      )}
    </div>
  );
}
