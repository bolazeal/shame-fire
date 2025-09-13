
'use server';

import { getComments, getPost } from '@/lib/firestore';
import type { Comment } from '@/lib/types';
import { CommentThreadClient } from '@/components/comment-thread-client';

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

export default async function CommentThreadPage({ params }: { params: { id: string; commentId: string }}) {
    const postId = params.id;
    const commentId = params.commentId;

    const [allComments, post] = await Promise.all([
        getComments(postId),
        getPost(postId)
    ]);
    
    const commentTree = buildCommentTree(allComments, commentId);

    return (
        <CommentThreadClient 
            initialCommentTree={commentTree} 
            postId={postId} 
            postAuthorId={post?.authorId || ''} 
        />
    );
}
