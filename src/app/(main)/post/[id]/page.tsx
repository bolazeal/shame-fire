'use client';

import { PostCard } from '@/components/post-card';
import { CommentCard } from '@/components/comment-card';
import { mockPosts, mockDisputes, mockUsers } from '@/lib/mock-data';
import { useParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user-avatar';

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const post = mockPosts.find((p) => p.id === params.id);

  // Using dispute comments for mock post comments for now
  const comments = mockDisputes[0]?.comments || [];

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

  const currentUser = mockUsers.user1;

  return (
    <div>
      {/* Display the main post */}
      <PostCard post={post} />

      {/* Reply/Comment Form Section */}
      <div className="border-t border-border p-4">
        <div className="flex gap-4">
          <UserAvatar user={currentUser} className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder={`Reply to @${post.author.username}...`}
              rows={3}
            />
            <div className="flex justify-end">
              <Button>Post Reply</Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Comments Section */}
      <div className="space-y-4 p-4">
        <h2 className="text-xl font-bold">Comments ({comments.length})</h2>
        {comments.length > 0 ? (
          <div className="flex flex-col gap-4">
            {comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
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
