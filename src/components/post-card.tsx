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

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const sentimentScoreColor =
    post.sentiment && post.sentiment.score < 0
      ? 'bg-red-500/20 text-red-400'
      : 'bg-green-500/20 text-green-400';

  return (
    <Link
      href={`/post/${post.id}`}
      className="block transition-colors hover:bg-accent/10"
    >
      <div className="flex gap-4 border-b p-4">
        <UserAvatar user={post.author} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold hover:underline">
                {post.author.name}
              </span>
              <span className="text-muted-foreground">
                @{post.author.username}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground hover:underline">
                {post.createdAt}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </Button>
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

          {post.mediaUrl && post.mediaType === 'image' && (
            <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-xl border">
              <Image
                src={post.mediaUrl}
                alt="Post media"
                layout="fill"
                objectFit="cover"
              />
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
              {post.sentiment.biasDetected && (
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
              )}
              {!post.sentiment.biasDetected && (
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
                className="flex items-center gap-2 rounded-full hover:text-amber-500"
              >
                <Bookmark className="h-5 w-5" />
                {post.bookmarks > 0 && <span>{post.bookmarks}</span>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full hover:text-primary"
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
