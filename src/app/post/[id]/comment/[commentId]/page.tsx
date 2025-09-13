'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommentCard } from '@/components/comment-card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { mockComments, mockUsers } from '@/lib/mock-data';
import type { Comment } from '@/lib/types';
import { useEffect, useState } from 'react';

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

export default function CommentThreadPage() {
  const router = useRouter();
  const params = useParams<{ id: string; commentId: string }>();
  const [parentComment, setParentComment] = useState<Comment | null>(null);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is a mock implementation.
    // In a real app, you would fetch the comment and its replies from Firestore.
    setLoading(true);
    const postId = params.id as string;
    const commentId = params.commentId as string;

    const findComment = (comments: Comment[]): Comment | undefined => {
        for(const c of comments) {
            if (c.id === commentId) return c;
        }
        return undefined;
    }

    const allComments = Object.values(mockComments).flat();
    const pComment = findComment(allComments);
    
    if (pComment) {
      setParentComment(pComment);
      // Mock replies
      setReplies([
        {
            id: 'reply1',
            author: mockUsers.user7,
            text: "That's a great point, I hadn't considered that perspective.",
            createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            upvotes: 2,
            downvotes: 0,
        },
        {
            id: 'reply2',
            author: mockUsers.user2,
            text: "I disagree, I think the original report was completely justified.",
            createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            upvotes: 5,
            downvotes: 1,
        },
      ]);
    }

    // Simulate loading delay
    setTimeout(() => setLoading(false), 500);

  }, [params.id, params.commentId]);

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

  if (!parentComment) {
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
        {/* The parent comment */}
        <CommentCard comment={parentComment} onDelete={async () => { router.back() }} postId={params.id as string} />
        
        <Separator className="my-4" />

        <h2 className="mb-4 text-lg font-bold">Replies</h2>
        <div className="space-y-4">
            {/* Replies to the parent comment */}
            {replies.map(reply => (
                <CommentCard key={reply.id} comment={reply} onDelete={async () => {}} postId={params.id as string} isReply />
            ))}
        </div>

        <div className="mt-8 text-center text-muted-foreground">
            <p className="text-sm">(Replying and voting functionality on this page is for demonstration.)</p>
        </div>
      </div>
    </div>
  );
}
