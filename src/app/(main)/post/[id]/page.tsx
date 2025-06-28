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
  const comments = mockDisputes[0].comments || [];

  if (!post) {
    return (
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold">Post Not Found</h1>
        <p className="text-muted-foreground">
          The post you are looking for does not exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PostCard post={post} />
      <div className="p-4">
        <div className="flex gap-4">
          <UserAvatar user={mockUsers.user1} className="h-10 w-10" />
          <div className="flex-1">
            <Textarea
              placeholder={`Reply to @${post.author.username}...`}
              rows={3}
            />
            <Button className="mt-2">Post Reply</Button>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  );
}
