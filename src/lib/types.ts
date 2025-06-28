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
  upvotes: number;
  downvotes: number;
  replies?: Comment[];
};

export type Post = {
  id: string;
  type: 'report' | 'endorsement';
  author: User;
  entity: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  category: string;
  createdAt: string;
  commentsCount: number;
  likes: number;
  shares: number;
  sentiment?: {
    score: number;
    biasDetected: boolean;
    biasExplanation?: string;
  };
  summary?: string;
};
