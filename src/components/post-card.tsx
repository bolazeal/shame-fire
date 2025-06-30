'use client';

import type { Post } from '@/lib/types';
import { UserAvatar } from './user-avatar';
import { Button } from './ui/button';
import {
  MessageCircle,
  Repeat,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share,
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  FileWarning,
  Award,
  Gavel,
  UserCircle,
  Megaphone,
  Trophy,
} from 'lucide-react';
import { Badge } from './ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import Link from 'next/link';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { mockUsers } from '@/lib/mock-data';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(post.bookmarks);

  const sentimentScoreColor =
    post.sentiment && post.sentiment.score < 0
      ? 'bg-red-500/20 text-red-400'
      : 'bg-green-500/20 text-green-400';

  const isAnonymous = post.postingAs === 'anonymous';
  const isWhistleblower = post.postingAs === 'whistleblower';

  const authorName = isAnonymous
    ? 'Anonymous'
    : isWhistleblower
    ? 'Whistleblower'
    : post.author.name;

  const authorUsername = isAnonymous
    ? 'anonymous'
    : isWhistleblower
    ? 'whistleblower'
    : post.author.username;

  const showVerifiedBadge =
    post.author.isVerified && !isAnonymous && !isWhistleblower;

  const handleEscalateConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: 'Post Escalated',
      description:
        'This report is now a public dispute in the Village Square.',
    });
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBookmarked) {
      setBookmarkCount(bookmarkCount - 1);
      toast({
        title: 'Bookmark Removed',
      });
    } else {
      setBookmarkCount(bookmarkCount + 1);
      toast({
        title: 'Post Bookmarked',
      });
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast({
      title: 'Link Copied',
      description: 'The link to the post has been copied to your clipboard.',
    });
  };

  const currentUser = mockUsers.user1;
  const canEscalate =
    post.type === 'report' &&
    (post.entity === currentUser.name ||
      post.text.includes(`@${currentUser.username}`));

  return (
    <Link
      href={`/post/${post.id}`}
      className="block transition-colors hover:bg-accent/10"
    >
      <div className="flex gap-4 border-b p-4">
        {isAnonymous || isWhistleblower ? (
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-muted">
              {isAnonymous ? (
                <UserCircle className="h-6 w-6 text-muted-foreground" />
              ) : (
                <Megaphone className="h-6 w-6 text-muted-foreground" />
              )}
            </AvatarFallback>
          </Avatar>
        ) : (
          <UserAvatar user={post.author} />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold hover:underline">{authorName}</span>
              {showVerifiedBadge && (
                <ShieldCheck className="h-4 w-4 text-primary" />
              )}
              <span className="text-muted-foreground">@{authorUsername}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground hover:underline">
                {post.createdAt}
              </span>
            </div>
            <div className="flex items-center">
              {canEscalate && (
                <AlertDialog>
                  <AlertDialogTrigger
                    asChild
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2 flex items-center gap-1 rounded-full px-2 text-xs"
                    >
                      <Gavel className="h-4 w-4" />
                      Escalate
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Escalate this report to the Village Square?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will create a public dispute. The community
                        will be able to discuss and vote on the matter. This
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleEscalateConfirm}>
                        Confirm & Escalate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
              >
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {post.type !== 'post' && (
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              {post.type === 'report' ? (
                <FileWarning className="h-4 w-4 text-destructive/80" />
              ) : (
                <Award className="h-4 w-4 text-green-500" />
              )}
              <p>
                <span className="font-medium capitalize">{post.type}</span> on{' '}
                <span className="font-semibold text-foreground">
                  {post.entity}
                </span>{' '}
                in{' '}
                <span className="font-semibold text-foreground">
                  {post.category}
                </span>
              </p>
            </div>
          )}

          <p className="mt-1 whitespace-pre-wrap text-base">{post.text}</p>

          {post.summary && post.type !== 'post' && (
            <p className="mt-2 rounded-lg bg-muted/50 p-2 text-sm italic text-muted-foreground">
              <span className="font-bold not-italic">AI Summary:</span>{' '}
              {post.summary}
            </p>
          )}

          {post.mediaUrl && (
            <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-xl border">
              {post.mediaType === 'image' ? (
                <Image
                  src={post.mediaUrl}
                  alt="Post media"
                  fill={true}
                  objectFit="cover"
                  data-ai-hint={post['data-ai-hint']}
                />
              ) : (
                <video
                  src={post.mediaUrl}
                  controls
                  className="h-full w-full bg-black object-contain"
                />
              )}
            </div>
          )}

          {post.type === 'endorsement' && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full font-bold"
              >
                <Trophy className="mr-2 h-4 w-4 text-amber-500" />
                Nominate {post.entity} for Medal
              </Button>
            </div>
          )}

          {post.sentiment && post.type !== 'post' && (
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn('border-none', sentimentScoreColor)}
              >
                Trust Score: {(post.sentiment.score * 100).toFixed(0)}
              </Badge>
              {post.sentiment.biasDetected ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="destructive">
                        <ShieldAlert className="mr-1 h-3 w-3" /> Bias Detected
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{post.sentiment.biasExplanation}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Badge
                  variant="outline"
                  className="border-none bg-green-500/20 text-green-400"
                >
                  <ShieldCheck className="mr-1 h-3 w-3" /> No Bias Detected
                </Badge>
              )}
            </div>
          )}

          <div className="mt-4 flex justify-between text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 rounded-full hover:text-primary"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{post.commentsCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 rounded-full hover:text-green-500"
            >
              <Repeat className="h-5 w-5" />
              <span>{post.reposts}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 rounded-full hover:text-sky-500"
            >
              <ThumbsUp className="h-5 w-5" />
              <span>{post.upvotes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 rounded-full hover:text-red-500"
            >
              <ThumbsDown className="h-5 w-5" />
              <span>{post.downvotes}</span>
            </Button>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'flex items-center gap-2 rounded-full hover:text-amber-500',
                  isBookmarked && 'text-amber-500'
                )}
                onClick={handleBookmarkClick}
              >
                <Bookmark
                  className={cn('h-5 w-5', isBookmarked && 'fill-current')}
                />
                {bookmarkCount > 0 && <span>{bookmarkCount}</span>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full hover:text-primary"
                onClick={handleShareClick}
              >
                <Share className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
