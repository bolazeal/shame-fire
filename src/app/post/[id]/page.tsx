
'use server';

import { PostCard } from '@/components/post-card';
import { getPost, getComments } from '@/lib/firestore';
import { Comment, Post } from '@/lib/types';
import { PostPageClient } from '@/components/post-page-client';


export default async function PostPage({ params }: { params: { id: string } }) {
  const postId = params.id as string;
  
  let post: Post | null = null;
  let comments: Comment[] = [];

  try {
      [post, comments] = await Promise.all([
          getPost(postId),
          getComments(postId)
      ]);
  } catch (error) {
      console.error("Failed to fetch post and comments", error);
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
      <PostPageClient initialPost={post} initialComments={comments} />
    </div>
  );
}
