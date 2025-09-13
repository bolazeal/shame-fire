
'use client';

import { useRouter } from 'next/navigation';
import type { Post } from '@/lib/types';
import { UserAvatar } from './user-avatar';
import { Button } from './ui/button';
import {
  MessageSquare,
  Share2,
  ArrowBigUp,
  ArrowBigDown,
  Star,
  Send,
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  FileWarning,
  Award,
  Gavel,
  UserCircle,
  Megaphone,
  Trophy,
  Loader2,
  Flag,
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
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  getUserByEntityName,
  hasUserNominated,
} from '@/lib/firestore';
import { toggleBookmarkAction, toggleVoteOnPostAction, toggleRepostAction, flagExistingPostAction } from '@/lib/actions/interaction';
import { createDisputeAction } from '@/lib/actions/dispute';
import { nominateUserForMedalFromPostAction } from '@/lib/actions/nomination';

import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { CreatePostDialog } from './create-post-dialog';

interface PostCardProps {
  post: Post;
}

const renderTextWithMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const username = part.substring(1);
        return (
          <Link
            key={index}
            href={`/profile/${username}`} // Note: This assumes username is unique and can be used as an ID. In a real app, you'd use a user ID.
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

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const { user: authUser, fullProfile } = useAuth();
  const { toast } = useToast();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(post.bookmarks);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);

  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
  const [voteCounts, setVoteCounts] = useState({
    upvotes: post.upvotes,
    downvotes: post.downvotes,
  });
  const [isVoteLoading, setIsVoteLoading] = useState(false);

  const [isReposted, setIsReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(post.reposts);
  const [isRepostLoading, setIsRepostLoading] = useState(false);

  const [isNominating, setIsNominating] = useState(false);
  const [hasNominated, setHasNominated] = useState(false);

  const [hasFlagged, setHasFlagged] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);


  useEffect(() => {
    let isMounted = true;
    const checkUserStatus = async () => {
      if (!authUser || !isMounted) return;

      // Set interaction states based on post data
      setIsBookmarked(post.bookmarkedBy.includes(authUser.uid));
      setIsReposted(post.repostedBy.includes(authUser.uid));
      setHasFlagged(post.flaggedBy?.includes(authUser.uid) ?? false);
      
      if (post.upvotedBy.includes(authUser.uid)) {
        setVoteStatus('up');
      } else if (post.downvotedBy.includes(authUser.uid)) {
        setVoteStatus('down');
      } else {
        setVoteStatus(null);
      }

      // Check nomination status asynchronously
      if (post.entity && post.type === 'endorsement') {
        try {
          const targetUser = await getUserByEntityName(post.entity);
          if (targetUser && isMounted) {
            const nominated = await hasUserNominated(
              authUser.uid,
              targetUser.id
            );
            if (isMounted) setHasNominated(nominated);
          }
        } catch (error) {
          console.error('Error checking nomination status', error);
        }
      }
    };

    checkUserStatus();

    return () => {
      isMounted = false;
    };
  }, [authUser, post]);

  const handleVoteClick = async (
    e: React.MouseEvent,
    voteType: 'up' | 'down'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!authUser) {
      toast({ title: 'Please log in to vote.', variant: 'destructive' });
      return;
    }
    setIsVoteLoading(true);

    const originalVoteStatus = voteStatus;
    const originalVoteCounts = { ...voteCounts };

    // Optimistic UI update
    setVoteCounts((currentCounts) => {
      let { upvotes, downvotes } = currentCounts;
      if (voteType === 'up') {
        if (originalVoteStatus === 'up') {
          // Toggling off upvote
          upvotes--;
        } else {
          upvotes++;
          if (originalVoteStatus === 'down') downvotes--; // Switching from down to up
        }
      } else {
        // voteType is 'down'
        if (originalVoteStatus === 'down') {
          // Toggling off downvote
          downvotes--;
        } else {
          downvotes++;
          if (originalVoteStatus === 'up') upvotes--; // Switching from up to down
        }
      }
      return { upvotes, downvotes };
    });

    setVoteStatus((currentStatus) => {
      if (currentStatus === voteType) return null; // Toggling off
      return voteType; // Setting new vote
    });

    try {
      await toggleVoteOnPostAction(authUser.uid, post.id, voteType);
    } catch (error) {
      // Revert optimistic update on error
      setVoteStatus(originalVoteStatus);
      setVoteCounts(originalVoteCounts);
      console.error('Failed to toggle vote:', error);
      toast({ title: 'Something went wrong.', variant: 'destructive' });
    } finally {
      setIsVoteLoading(false);
    }
  };

  const handleRepostClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!authUser) {
      toast({ title: 'Please log in to repost.', variant: 'destructive' });
      return;
    }
    setIsRepostLoading(true);
    try {
      await toggleRepostAction(authUser.uid, post.id, isReposted);
      setIsReposted(!isReposted);
      setRepostCount((prev) => prev + (isReposted ? -1 : 1));
      toast({
        title: isReposted ? 'Repost undone' : 'Post Reposted',
      });
    } catch (error) {
      console.error('Failed to toggle repost', error);
      toast({ title: 'Something went wrong.', variant: 'destructive' });
    } finally {
      setIsRepostLoading(false);
    }
  };

  const sentimentScoreColor =
    post.sentiment && post.sentiment.score < 0
      ? 'bg-red-500/20 text-red-400'
      : 'bg-green-500/20 text-green-400';

  const isAnonymous = post.postingAs === 'anonymous';
  const isWhistleblower = post.postingAs === 'whistleblower';

  const authorName = post.author.name;
  const authorUsername = post.author.username;

  const showVerifiedBadge =
    post.author.isVerified && !isAnonymous && !isWhistleblower;

  const handleEscalateConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!fullProfile || !post.entity) {
      toast({
        title: 'Error',
        description: 'Cannot escalate this post.',
        variant: 'destructive',
      });
      return;
    }

    setIsEscalating(true);
    try {
      const disputeId = await createDisputeAction(post, fullProfile);
      toast({
        title: 'Post Escalated',
        description:
          'This report is now a public dispute in the Village Square.',
      });
      // You might want to update the post state to reflect `isEscalated: true`
      // to disable the button immediately, but for now we rely on page refresh or router push.
      router.push(`/dispute/${disputeId}`);
    } catch (error) {
      console.error('Failed to escalate post:', error);
      toast({
        title: 'Escalation Failed',
        description: 'Could not create a dispute.',
        variant: 'destructive',
      });
    } finally {
      setIsEscalating(false);
    }
  };

  const handleNominateFromPost = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!authUser || !post.entity) {
      toast({ title: 'Cannot nominate from this post.', variant: 'destructive' });
      return;
    }
    setIsNominating(true);
    try {
      await nominateUserForMedalFromPostAction(post.entity, authUser.uid);
      setHasNominated(true);
      toast({
        title: 'Nomination successful!',
        description: `${post.entity} has been nominated for a Medal of Honour.`,
      });
    } catch (error: any) {
      toast({
        title: 'Nomination failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsNominating(false);
    }
  };

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!authUser) {
      toast({
        title: 'Please log in to bookmark posts.',
        variant: 'destructive',
      });
      return;
    }
    setIsBookmarkLoading(true);
    try {
      await toggleBookmarkAction(authUser.uid, post.id, isBookmarked);
      setIsBookmarked(!isBookmarked);
      setBookmarkCount((prev) => prev + (isBookmarked ? -1 : 1));
      toast({
        title: isBookmarked ? 'Bookmark Removed' : 'Post Bookmarked',
      });
    } catch (error) {
      console.error('Failed to toggle bookmark', error);
      toast({ title: 'Something went wrong.', variant: 'destructive' });
    } finally {
      setIsBookmarkLoading(false);
    }
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

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/post/${post.id}`);
  };

  const handleFlagPost = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authUser) {
      toast({ title: 'Please log in to flag posts.', variant: 'destructive' });
      return;
    }
    setIsFlagging(true);
    try {
      await flagExistingPostAction(post.id, post.text, post.author, authUser.uid);
      setHasFlagged(true);
      toast({
        title: 'Post Flagged',
        description: 'Thank you. Our moderators will review this post.',
      });
    } catch (error: any) {
      console.error('Failed to flag post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Could not flag this post.',
        variant: 'destructive',
      });
    } finally {
      setIsFlagging(false);
    }
  };

  const canEscalate =
    post.type === 'report' &&
    fullProfile &&
    (post.entity === fullProfile.name || (fullProfile.username && post.entity === fullProfile.username)) &&
    !post.isEscalated;

  const postDate = post.createdAt ? new Date(post.createdAt) : new Date();

  return (
    <article
      onClick={handleCardClick}
      className="cursor-pointer transition-colors hover:bg-accent/10"
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
          <UserAvatar user={post.author as any} />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link
                href={`/profile/${post.author.username}`}
                onClick={(e) => e.stopPropagation()}
                className="font-bold hover:underline"
              >
                {authorName}
              </Link>
              {showVerifiedBadge && (
                <ShieldCheck className="h-4 w-4 text-primary" />
              )}
              <span className="text-muted-foreground">@{authorUsername}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground" suppressHydrationWarning>
                {formatDistanceToNow(postDate, { addSuffix: true })}
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
                      disabled={isEscalating}
                    >
                      {isEscalating ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <Gavel className="h-4 w-4" />
                      )}
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
                        {isEscalating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Confirm & Escalate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {post.isEscalated && (
                <Badge variant="secondary" className="mr-2 text-xs">
                  <Gavel className="mr-1 h-3 w-3" /> Escalated
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    onClick={(e) => e.stopPropagation()}
                    asChild
                  >
                    <CreatePostDialog
                      dialogTitle="Endorse this entity"
                      initialValues={{
                        type: 'endorsement',
                        entity: post.entity,
                      }}
                      trigger={
                        <div
                          className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Award className="mr-2 h-4 w-4" />
                          <span>Endorse {post.entity}</span>
                        </div>
                      }
                    />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => e.stopPropagation()}
                    asChild
                  >
                     <CreatePostDialog
                      dialogTitle="Report this entity"
                      initialValues={{
                        type: 'report',
                        entity: post.entity,
                      }}
                      trigger={
                        <div
                          className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Flag className="mr-2 h-4 w-4" />
                          <span>Report {post.entity}</span>
                        </div>
                      }
                    />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        disabled={hasFlagged || isFlagging}
                        onSelect={(e) => e.preventDefault()}
                      >
                        {isFlagging ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Flag className="mr-2 h-4 w-4" />
                        )}
                        <span>{hasFlagged ? 'Flagged' : 'Flag Post'}</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Flag this post?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will submit the post for moderator review. Are
                          you sure this content is inappropriate?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFlagPost}>
                          Confirm Flag
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
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

          <p className="mt-1 whitespace-pre-wrap text-base">{renderTextWithMentions(post.text)}</p>

          {post.summary && post.type !== 'post' && (
            <p className="mt-2 rounded-lg bg-muted/50 p-2 text-sm italic text-muted-foreground">
              <span className="font-bold not-italic">AI Summary:</span>{' '}
              {post.summary}
            </p>
          )}

          {post.mediaUrl && (
            <div
              className="relative mt-2 aspect-video w-full overflow-hidden rounded-xl border"
              onClick={(e) => e.stopPropagation()}
            >
              {post.mediaType === 'image' ? (
                <Image
                  src={post.mediaUrl}
                  alt="Post media"
                  fill={true}
                  style={{ objectFit: 'cover' }}
                  data-ai-hint={post['data-ai-hint']}
                />
              ) : (
                <video
                  src={post.mediaUrl}
                  controls
                  className="h-full w-full bg-black object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          )}

          {post.type === 'endorsement' && (
            <div className="mt-4 flex justify-end">
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
                    className="rounded-full font-bold"
                    disabled={isNominating || hasNominated}
                  >
                    {isNominating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trophy className="mr-2 h-4 w-4 text-amber-500" />
                    )}
                    {hasNominated
                      ? 'Nominated'
                      : `Nominate ${post.entity} for Medal`}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Nominate {post.entity}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will formally nominate {post.entity} for a Medal of
                      Honour, recognizing their positive impact. This action is
                      public.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleNominateFromPost}
                      disabled={isNominating}
                    >
                      Confirm Nomination
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
              <MessageSquare className="h-5 w-5" />
              <span>{post.commentsCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRepostClick}
              disabled={isRepostLoading}
              className={cn(
                'flex items-center gap-2 rounded-full hover:text-green-500',
                isReposted && 'text-green-500'
              )}
            >
              {isRepostLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Share2 className="h-5 w-5" />
              )}
              <span>{repostCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleVoteClick(e, 'up')}
              disabled={isVoteLoading}
              className={cn(
                'flex items-center gap-2 rounded-full hover:text-sky-500',
                voteStatus === 'up' && 'text-sky-500'
              )}
            >
              {isVoteLoading && voteStatus !== 'down' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowBigUp
                  className={cn(
                    'h-5 w-5',
                    voteStatus === 'up' && 'fill-current'
                  )}
                />
              )}
              <span>{voteCounts.upvotes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleVoteClick(e, 'down')}
              disabled={isVoteLoading}
              className={cn(
                'flex items-center gap-2 rounded-full hover:text-red-500',
                voteStatus === 'down' && 'text-red-500'
              )}
            >
              {isVoteLoading && voteStatus !== 'up' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowBigDown
                  className={cn(
                    'h-5 w-5',
                    voteStatus === 'down' && 'fill-current'
                  )}
                />
              )}
              <span>{voteCounts.downvotes}</span>
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
                disabled={isBookmarkLoading}
              >
                {isBookmarkLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Star
                    className={cn('h-5 w-5', isBookmarked && 'fill-current')}
                  />
                )}
                {bookmarkCount > 0 && <span>{bookmarkCount}</span>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full hover:text-primary"
                onClick={handleShareClick}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
