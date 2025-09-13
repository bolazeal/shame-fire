
'use client';

import { useState, useCallback } from 'react';
import type { Post, Comment } from '@/lib/types';
import { getComments } from '@/lib/firestore';
import { deleteCommentAction } from '@/lib/actions/interaction';
import { CommentForm } from '@/components/comment-form';
import { CommentThread } from '@/components/comment-thread';
import { Separator } from './ui/separator';


function buildCommentTree(comments: Comment[]): (Comment & { replies: Comment[] })[] {
  const commentMap = new Map<string, Comment & { replies: Comment[] }>();
  const rootComments: (Comment & { replies: Comment[] })[] = [];

  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  comments.forEach(comment => {
    if (comment.parentId && commentMap.has(comment.parentId)) {
      const parent = commentMap.get(comment.parentId)!;
      parent.replies.push(commentMap.get(comment.id)!);
    } else {
      rootComments.push(commentMap.get(comment.id)!);
    }
  });

  return rootComments;
}

export function PostPageClient({ initialPost, initialComments }: { initialPost: Post, initialComments: Comment[]}) {
  const [post] = useState<Post>(initialPost);
  const [comments, setComments] = useState<Comment[]>(initialComments);

  const fetchComments = useCallback(async () => {
    const commentsData = await getComments(post.id);
    setComments(commentsData);
  }, [post.id]);

  const handleCommentAdded = () => {
    fetchComments();
  }

  const handleDeleteComment = async (commentId: string) => {
    await deleteCommentAction(post.id, commentId);
    fetchComments();
  };

  const commentTree = buildCommentTree(comments);

  return (
    <>
      <div className="border-t border-border p-4">
        <CommentForm 
            postId={post.id} 
            postAuthorId={post.authorId}
            onCommentAdded={handleCommentAdded}
        />
      </div>

      <Separator />

      <div className="space-y-4 p-4">
        <h2 className="text-xl font-bold">Comments ({comments.length})</h2>
        {commentTree.length > 0 ? (
          <div className="flex flex-col">
            {commentTree.map((comment) => (
                <CommentThread
                    key={comment.id}
                    comment={comment}
                    postId={post.id}
                    postAuthorId={post.authorId}
                    onDelete={handleDeleteComment}
                    onReplySuccess={handleCommentAdded}
                />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>No comments yet. Be the first to reply!</p>
          </div>
        )}
      </div>
    </>
  );
}
