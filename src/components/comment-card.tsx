
'use client';

import type { Comment } from '@/lib/types';
import { UserAvatar } from './user-avatar';
import { Button } from './ui/button';
import { ArrowBigUp, ArrowBigDown, MessageSquare, MoreHorizontal, Trash2, Loader2, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { CommentForm } from './comment-form';

interface CommentCardProps {
  comment: Comment;
  onDelete: (commentId: string) => Promise<void>;
  onReplySuccess: () => void;
  postId: string;
  postAuthorId: string;
}

const renderTextWithMentions = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.substring(1);
        return (
          <Link
            key={index}
            href={`/profile/${username}`}
            className="text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        );
      }
      return part;
    });
};

export function CommentCard({ comment, onDelete, onReplySuccess, postId, postAuthorId }: CommentCardProps) {
  const commentDate = comment.createdAt ? new Date(comment.createdAt) : new Date();
  const { user: authUser } = useAuth();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const isAuthor = authUser?.uid === comment.author.id;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
      toast({ title: "Comment Deleted", description: "Your comment has been successfully removed."});
      setIsAlertOpen(false); // Close the dialog on success
    } catch (error) {
        console.error("Failed to delete comment:", error);
        toast({ title: "Error", description: "Could not delete comment.", variant: 'destructive' });
    } finally {
        setIsDeleting(false);
    }
  }
  
  return (
    <div className="flex gap-4">
      <UserAvatar user={comment.author} className="h-10 w-10" />
      <div className="flex-1">
        <div className="rounded-lg bg-muted p-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href={`/profile/${comment.author.username}`} className="font-bold hover:underline" onClick={e => e.stopPropagation()}>
                {comment.author.name}
            </Link>
            {comment.authorIsAdmin && (
              <Badge variant="secondary" className="border-red-500/50 text-red-500">
                <ShieldCheck className="mr-1 h-3 w-3" />
                Admin
              </Badge>
            )}
            <span className="text-muted-foreground">
              @{comment.author.username}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground" suppressHydrationWarning>{formatDistanceToNow(commentDate, { addSuffix: true })}</span>
          </div>
          <div className="mt-2 text-base">{renderTextWithMentions(comment.text)}</div>
          {comment.mediaUrl && (
            <div
              className="relative mt-2 aspect-video w-full max-w-sm overflow-hidden rounded-lg border"
              onClick={(e) => e.stopPropagation()}
            >
              {comment.mediaType === 'image' ? (
                <Image
                  src={comment.mediaUrl}
                  alt="Comment media"
                  fill={true}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <video
                  src={comment.mediaUrl}
                  controls
                  className="h-full w-full bg-black object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ArrowBigUp className="h-4 w-4" />
              <span>{comment.upvotes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ArrowBigDown className="h-4 w-4" />
              <span>{comment.downvotes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => setShowReplyForm(!showReplyForm)}>
                <MessageSquare className="h-4 w-4" />
                <span>Reply</span>
            </Button>
          </div>
          
          {isAuthor && onDelete && (
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    comment.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete Comment
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {showReplyForm && (
            <div className="mt-4">
                <CommentForm
                    postId={postId}
                    postAuthorId={postAuthorId}
                    parentId={comment.id}
                    onCommentAdded={() => {
                        setShowReplyForm(false);
                        onReplySuccess();
                    }}
                    placeholder={`Replying to @${comment.author.username}...`}
                    isReply
                />
            </div>
        )}
      </div>
    </div>
  );
}

    