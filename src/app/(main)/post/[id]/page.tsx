
'use client';

import { PostCard } from '@/components/post-card';
import { CommentCard } from '@/components/comment-card';
import { useParams } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user-avatar';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getPost, getComments } from '@/lib/firestore';
import type { Post, Comment } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Image as ImageIcon, Loader2, Video as VideoIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addCommentAction, deleteCommentAction } from '@/lib/actions/interaction';
import Image from 'next/image';
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const { user: authUser, fullProfile } = useAuth();
  const { toast } = useToast();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [mediaDataUrl, setMediaDataUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const postId = params.id as string;

  const fetchPostAndComments = useCallback(async () => {
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
    if (postId) {
        fetchPostAndComments();
    }
  }, [postId, fetchPostAndComments]);

  const clearMedia = () => {
    setMediaPreview(null);
    setMediaDataUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview({ url: reader.result as string, type });
        setMediaDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCommentSubmit = async () => {
      if ((!newComment.trim() && !mediaDataUrl) || !fullProfile || !post) return;

      setIsSubmitting(true);
      try {
          await addCommentAction(post.id, post.authorId, {
            text: newComment,
            mediaUrl: mediaDataUrl || undefined,
            mediaType: mediaPreview?.type,
          }, fullProfile);
          setNewComment("");
          clearMedia();
          // Refetch comments to show the new one
          fetchPostAndComments();
      } catch (error) {
          console.error("Failed to add comment", error);
          toast({
            title: 'Comment Failed',
            description: 'Could not post your comment.',
            variant: 'destructive',
          });
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!post) throw new Error("Post not found");
    await deleteCommentAction(post.id, commentId);
    // After deletion, refetch to update UI
    fetchPostAndComments();
  };


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
    <TooltipProvider>
    <div>
      <PostCard post={post} />

      <div className="border-t border-border p-4">
        <div className="flex gap-4">
          {authUser ? (
            <UserAvatar user={authUser} className="h-10 w-10" />
           ) : (
            <Skeleton className="h-10 w-10 rounded-full" />
           )}
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder={authUser ? `Reply to @${post.author.username}...` : "Log in to leave a comment."}
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!authUser || isSubmitting}
            />
            {mediaPreview && (
              <div className="relative mt-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 z-10 h-6 w-6 rounded-full"
                    onClick={clearMedia}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {mediaPreview.type === 'image' ? (
                    <Image
                      src={mediaPreview.url}
                      alt="Preview"
                      width={500}
                      height={300}
                      className="max-h-60 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <video
                      src={mediaPreview.url}
                      controls
                      className="max-h-60 w-full rounded-lg"
                    />
                  )}
              </div>
            )}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <input
                    type="file"
                    ref={imageInputRef}
                    onChange={(e) => handleFileSelect(e, 'image')}
                    accept="image/*"
                    className="hidden"
                    />
                    <input
                    type="file"
                    ref={videoInputRef}
                    onChange={(e) => handleFileSelect(e, 'video')}
                    accept="video/*"
                    className="hidden"
                    />
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={!authUser || isSubmitting}
                        >
                            <ImageIcon className="h-5 w-5 text-primary" />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Add Image</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => videoInputRef.current?.click()}
                            disabled={!authUser || isSubmitting}
                        >
                            <VideoIcon className="h-5 w-5 text-primary" />
                        </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        <p>Add Video</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <Button onClick={handleCommentSubmit} disabled={!authUser || isSubmitting || (!newComment.trim() && !mediaDataUrl)}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Post Reply
                </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4 p-4">
        <h2 className="text-xl font-bold">Comments ({comments.length})</h2>
        {comments.length > 0 ? (
          <div className="flex flex-col gap-4">
            {comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} onDelete={handleDeleteComment} postId={post.id} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>No comments yet. Be the first to reply!</p>
          </div>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
}
