import type { ElementType } from 'react';

export type User = {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  'data-ai-hint'?: string;
  trustScore?: number;
  isVerified?: boolean;
  bio?: string;
  awards?: Award[];
  nominations?: number;
  publicVotes?: number;
};

export type Award = {
  name: string;
  year: number;
  icon: ElementType;
};

export type MedalInfo = {
  title: string;
  description: string;
  icon: ElementType;
};

export type Comment = {
  id: string;
  author: User;
  text: string;
  createdAt: string;
  shameRank: number; // 0-10 rating
  replies?: Comment[];
};

export type Post = {
  id: string;
  type: 'report' | 'endorsement' | 'post';
  author: User;
  postingAs?: 'verified' | 'anonymous' | 'whistleblower';
  entity?: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  'data-ai-hint'?: string;
  category?: string;
  createdAt: string;
  commentsCount: number;
  upvotes: number;
  downvotes: number;
  reposts: number;
  bookmarks: number;
  sentiment?: {
    score: number;
    biasDetected: boolean;
    biasExplanation?: string;
  };
  summary?: string;
};

export type Poll = {
  question: string;
  options: {
    text: string;
    votes: number;
  }[];
};

export type Verdict = {
  moderator: User;
  decision: string;
  reason: string;
};

export type Dispute = {
  id: string;
  title: string;
  description: string;
  involvedParties: User[];
  createdAt: string;
  status: 'open' | 'voting' | 'closed';
  commentsCount: number;
  poll: Poll;
  verdict: Verdict | null;
  comments?: Comment[];
};

export type FlaggedContent = {
  id:string;
  content: string;
  contentType: 'post' | 'comment';
  author: User;
  reason: string;
  flaggedAt: string;
};
