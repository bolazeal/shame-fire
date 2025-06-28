export type User = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  'data-ai-hint'?: string;
  trustScore: number;
  isVerified: boolean;
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
};
