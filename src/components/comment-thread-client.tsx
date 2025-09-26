
'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getComments, getPost } from '@/lib/firestore';
import type { Comment } from '@/lib/types';
import { useEffect, useState } from 'react';
import { CommentThread } from '@/components/comment-thread';
import { deleteCommentAction } from '@/lib/actions/interaction';

function buildCommentTree(comments: Comment[], rootId: string): (Comment & { replies: Comment[] }) | null {
  const commentMap = new Map<string, Comment & { replies: Comment[] }>();
  
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  comments.forEach(comment => {
    if (comment.parentId && commentMap.has(comment.parentId)) {
      const parent = commentMap.get(comment.parentId)!;
      parent.replies.push(commentMap.get(comment.id)!);
    }
  });

  return commentMap.get(rootId) || null;
}

function CommentThreadSkeleton() {
  return (
    <div className="p-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="ml-14 mt-4 space-y-4 border-l pl-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommentThreadClient({ initialCommentTree, postId, postAuthorId }: {
    initialCommentTree: (Comment & { replies: Comment[] }) | null,
    postId: string,
    postAuthorId: string
}) {
  const router = useRouter();
  const params = useParams<{ commentId: string }>();
  const [commentTree, setCommentTree] = useState(initialCommentTree);
  const [loading, setLoading] = useState(false); // Initial load is done on server

  const commentId = params.commentId as string;

  const fetchData = async () => {
    setLoading(true);
    try {
        const allComments = await getComments(postId);
        const tree = buildCommentTree(allComments, commentId);
        setCommentTree(tree);

    } catch (e) {
        console.error("Failed to fetch comment thread", e);
    } finally {
        setLoading(false);
    }
  }

  const handleDelete = async (commentIdToDelete: string) => {
    await deleteCommentAction(postId, commentIdToDelete);
    if (commentIdToDelete === commentId) {
        router.back();
    } else {
        fetchData();
    }
  };


  if (loading) {
    return (
      <div>
        <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-32" />
        </header>
        <CommentThreadSkeleton />
      </div>
    );
  }

  if (!commentTree) {
    return (
      <div>
        <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <h1 className="text-xl font-bold">Thread</h1>
        </header>
        <div className="p-8 text-center text-muted-foreground">
          <p>Comment not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/80 p-4 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold font-headline">Thread</h1>
      </header>

      <div className="p-4">
        <CommentThread 
            comment={commentTree as any}
            postId={postId}
            postAuthorId={postAuthorId}
            onDelete={handleDelete}
            onReplySuccess={fetchData}
            isThreadView={true}
        />
      </div>
    </div>
  );
}
