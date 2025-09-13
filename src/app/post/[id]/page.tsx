
'use client';

import { PostCard } from '@/components/post-card';
import { useParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect, useCallback } from 'react';
import { getPost, getComments } from '@/lib/firestore';
import type { Post, Comment } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { addCommentAction, deleteCommentAction } from '@/lib/actions/interaction';
import { CommentForm } from '@/components/comment-form';
import { CommentThread } from '@/components/comment-thread';


function buildCommentTree(comments: Comment[]): (Comment & { replies: Comment[] })[] {
  const commentMap = new Map<string, Comment & { replies: Comment[] }>();
  const rootComments: (Comment & { replies: Comment[] })[] = [];

  // Initialize map with all comments and an empty replies array
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Populate replies
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


function PostPageSkeleton() {
    return (
        <div>
            <div className="flex gap-4 border-b p-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="mt-4 h-48 w-full" />
                </div>
            </div>
            <div className="p-4 space-y-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    )
}

export default function PostPage() {
  const params = useParams<{ id: string }>();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const postId = params.id as string;

  const fetchPostAndComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
        const [postData, commentsData] = await Promise.all([
            getPost(postId),
            getComments(postId)
        ]);
        setPost(postData);
        setComments(commentsData);
    } catch (error) {
        console.error("Failed to fetch post and comments", error);
    } finally {
        setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPostAndComments();
  }, [fetchPostAndComments]);

  const handleCommentAdded = () => {
    // Refetch comments to show the new one and its updated position
    fetchPostAndComments();
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!post) throw new Error("Post not found");
    await deleteCommentAction(post.id, commentId);
    // After deletion, refetch to update UI and counts
    fetchPostAndComments();
  };

  const commentTree = buildCommentTree(comments);

  if (loading) {
    return <PostPageSkeleton />;
  }

  if (!post) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Post Not Found</h1>
          <p className="text-muted-foreground">
            The post you are looking for does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PostCard post={post} />

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
    </div>
  );
}
