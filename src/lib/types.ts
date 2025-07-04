
'use server';
import type { ElementType } from 'react';
import type { z } from 'zod';
import type { createPostFormSchema } from '@/components/create-post-form';

export type User = {
  id: string; // Firebase Auth UID
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bannerUrl?: string;
  'data-ai-hint'?: string;
  trustScore: number;
  isVerified: boolean;
  isAdmin?: boolean;
  bio?: string;
  location?: string;
  website?: string;
  nominations: number;
  publicVotes: number;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  accountStatus: 'active' | 'suspended' | 'banned';
};

export type MedalInfo = {
  title: string;
  description: string;
  icon: ElementType;
};

export type Comment = {
  id: string;
  author: {
    // Simplified embedded author object
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  text: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
};

export type Post = {
  id: string;
  type: 'report' | 'endorsement' | 'post';
  author: {
    id:string;
    name: string;
    username: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  authorId: string; // Reference to author's UID
  postingAs?: 'verified' | 'anonymous' | 'whistleblower';
  entity?: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  'data-ai-hint'?: string;
  category?: string;
  createdAt: string;
  commentsCount: number;
  reposts: number;
  repostedBy: string[];
  upvotes: number;
  downvotes: number;
  bookmarks: number;
  bookmarkedBy: string[]; // Array of user IDs who bookmarked
  upvotedBy: string[];
  downvotedBy: string[];
  sentiment?: {
    score: number;
    biasDetected: boolean;
    biasExplanation?: string;
  };
  summary?: string;
  isEscalated?: boolean;
};

export type Poll = {
  question: string;
  options: {
    text: string;
    votes: number;
  }[];
  voters?: string[]; // Tracks user IDs who have voted
};

export type Verdict = {
  moderator: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  decision: string;
  reason: string;
};

export type Dispute = {
  id: string;
  title: string;
  description: string;
  involvedParties: User[];
  originalPostId: string;
  createdAt: string;
  status: 'open' | 'voting' | 'closed';
  commentsCount: number;
  poll: Poll;
  verdict: Verdict | null;
  comments?: Comment[];
};

export type PostCreationData = z.infer<typeof createPostFormSchema>;

export type FlaggedContent = {
  id: string;
  postData: PostCreationData;
  author: User; // The full user object of who tried to post it
  reason: string; // AI's reason for flagging
  flaggedAt: string;
};

export interface ModerationContextType {
  addFlaggedItem: (
    postData: PostCreationData,
    author: User,
    reason: string
  ) => Promise<void>;
}

export type Notification = {
  id: string;
  type: 'follow' | 'upvote' | 'repost' | 'comment' | 'mention' | 'dispute';
  sender: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
  recipientId: string;
  postId?: string;
  postText?: string;
  disputeId?: string;
  read: boolean;
  createdAt: string;
};

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAllAsRead: () => Promise<void>;
}
