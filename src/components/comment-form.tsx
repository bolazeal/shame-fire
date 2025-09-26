
'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user-avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Image as ImageIcon, Video as VideoIcon, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import { addCommentAction } from '@/lib/actions/interaction';
import { cn } from '@/lib/utils';

interface CommentFormProps {
  postId: string;
  postAuthorId: string;
  parentId?: string | null;
  onCommentAdded: () => void;
  placeholder?: string;
  isReply?: boolean;
}

export function CommentForm({
  postId,
  postAuthorId,
  parentId = null,
  onCommentAdded,
  placeholder,
  isReply = false,
}: CommentFormProps) {
  const { user: authUser, fullProfile } = useAuth();
  const { toast } = useToast();

  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [mediaDataUrl, setMediaDataUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const clearMedia = () => {
    setMediaPreview(null);
    setMediaDataUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview({ url: reader.result as string, type });
        setMediaDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCommentSubmit = async () => {
    if ((!newComment.trim() && !mediaDataUrl) || !fullProfile) return;

    setIsSubmitting(true);
    try {
      await addCommentAction(postId, postAuthorId, {
        text: newComment,
        mediaUrl: mediaDataUrl || undefined,
        mediaType: mediaPreview?.type,
        parentId,
      }, fullProfile);
      setNewComment('');
      clearMedia();
      onCommentAdded();
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

  return (
    <TooltipProvider>
      <div className="flex gap-4">
        {authUser ? (
          <UserAvatar user={authUser} className={cn("h-10 w-10", isReply && "h-8 w-8")} />
        ) : (
          <Skeleton className={cn("h-10 w-10 rounded-full", isReply && "h-8 w-8")} />
        )}
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder={authUser ? (placeholder || "Add a comment...") : "Log in to leave a comment."}
            rows={isReply ? 2 : 3}
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
              <input type="file" ref={imageInputRef} onChange={(e) => handleFileSelect(e, 'image')} accept="image/*" className="hidden" />
              <input type="file" ref={videoInputRef} onChange={(e) => handleFileSelect(e, 'video')} accept="video/*" className="hidden" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => imageInputRef.current?.click()} disabled={!authUser || isSubmitting}>
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Add Image</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => videoInputRef.current?.click()} disabled={!authUser || isSubmitting}>
                    <VideoIcon className="h-5 w-5 text-primary" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Add Video</p></TooltipContent>
              </Tooltip>
            </div>
            <Button onClick={handleCommentSubmit} size={isReply ? "sm" : "default"} disabled={!authUser || isSubmitting || (!newComment.trim() && !mediaDataUrl)}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isReply ? "Post Reply" : "Post Comment"}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
