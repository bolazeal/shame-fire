import type { ElementType } from 'react';
import { z } from 'zod';

export const createPostFormSchema = z
  .object({
    type: z.enum(['report', 'endorsement', 'post']),
    postingAs: z.enum(['verified', 'anonymous', 'whistleblower']),
    entity: z.string().optional(),
    text: z.string().min(1, { message: "This field can't be empty." }),
    category: z.string().optional(),
    mediaUrl: z.string().optional(),
    mediaType: z.enum(['image', 'video']).optional(),
    entityContactEmail: z.string().email({ message: 'Please enter a valid email.' }).optional().or(z.literal('')),
    entityContactPhone: z.string().optional(),
    entityContactSocialMedia: z.string().url({ message: 'Please enter a valid URL.' }).optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.type !== 'post') {
      if (!data.entity || data.entity.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Entity name must be at least 2 characters.',
          path: ['entity'],
        });
      }
      if (!data.text || data.text.length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Description must be at least 10 characters for reports and endorsements.',
          path: ['text'],
        });
      }
      if (!data.category || data.category.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A category must be selected.',
          path: ['category'],
        });
      }
    }
  });

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
  moderatorNominationsCount?: number;
  publicVotes: number;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  accountStatus: 'active' | 'suspended' | 'banned';
  suggestionSource?: string; // Used for tracking suggestion origins
};

export type Participant = {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
};

export type Conversation = {
  id: string;
  participantIds: string[];
  participants: Participant[];
  createdAt: string;
  lastMessageText?: string;
  lastMessageTimestamp?: string;
  lastMessageSenderId?: string;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
};

export type MedalInfo = {
  title: string;
  description: string;
  icon: ElementType;
};

export type MedalNomination = {
  nominatorId: string;
  medalTitle: string;
  nominatedAt: any; // serverTimestamp
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
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
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
  entityContact?: {
    email?: string;
    phone?: string;
    socialMedia?: string;
  };
  text: string;
  keywords?: string[];
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
  flaggedBy?: string[]; // Array of user IDs who flagged the post
  isEscalated?: boolean;
  sentiment?: {
    score: number;
    biasDetected: boolean;
    biasExplanation?: string;
  };
  summary?: string;
  advocacy?: {
    isAdvocacyCause: boolean;
    title: string;
    reasoning: string;
    goalAmount: number;
    currentAmount: number;
    contributorsCount: number;
    contributors?: string[];
  };
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
  status: 'voting' | 'closed';
  commentsCount: number;
  poll: Poll;
  verdict: Verdict | null;
};

export type PostCreationData = z.infer<typeof createPostFormSchema>;

export type FlaggedContent = {
  id: string;
  postData?: PostCreationData;
  postId?: string;
  postText?: string;
  author: Partial<User>;
  reason: string;
  flaggedAt: string;
  flaggedByUserId?: string;
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
  type: 'follow' | 'upvote' | 'repost' | 'comment' | 'mention';
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

export type Video = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  'data-ai-hint'?: string;
  videoUrl: string;
  duration: string;
  channel: string;
  views: string;
  uploadedAt: string;
  createdAt: string; // ISO string from Firestore timestamp for sorting
};

export type PlatformSettings = {
  platformName: string;
  platformDescription: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  defaultTrustScore: number;
  minimumTrustScore: number;
  maximumTrustScore: number;
  maxPostLength: number;
  allowAnonymousPosts: boolean;
  moderateNewUserContent: boolean;
  autoFlagThreshold: number;
  enableAiModeration: boolean;
  aiModerationSensitivity: 'low' | 'medium' | 'high';
  flaggedContentRetentionDays: number;
  featureShameTv: boolean;
  featureVillageSquare: boolean;
  featureHallOfHonour: boolean;
  featureDirectMessages: boolean;
};
