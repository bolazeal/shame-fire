import type { ElementType } from 'react';
import type { Timestamp } from 'firebase/firestore';

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
  bio?: string;
  nominations: number;
  publicVotes: number;
  followersCount: number;
  followingCount: number;
  createdAt: Timestamp;
};

export type MedalInfo = {
  title: string;
  description: string;
  icon: ElementType;
};

export type Comment = {
  id: string;
  author: User; // Embedded author object for easy display
  text: string;
  createdAt: Timestamp;
  upvotes: number;
  downvotes: number;
};

export type Post = {
  id: string;
  type: 'report' | 'endorsement' | 'post';
  author: User; // Embedded author object
  authorId: string; // Reference to author's UID
  postingAs?: 'verified' | 'anonymous' | 'whistleblower';
  entity?: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  'data-ai-hint'?: string;
  category?: string;
  createdAt: Timestamp;
  commentsCount: number;
  reposts: number;
  upvotes: number;
  downvotes: number;
  bookmarks: number;
  bookmarkedBy: string[]; // Array of user IDs who bookmarked
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

export interface ModerationContextType {
  flaggedContent: FlaggedContent[];
  addFlaggedItem: (item: Omit<FlaggedContent, 'id' | 'flaggedAt'>) => void;
  dismissFlaggedItem: (id: string) => void;
  removeFlaggedItem: (id: string) => void;
}
