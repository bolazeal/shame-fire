
import type { User, Post, Dispute, Award, FlaggedContent } from '@/lib/types';

export const mockUsers: Record<string, User> = {};
export const mockPosts: Post[] = [];

// We are keeping this mock data for now to avoid breaking pages we aren't converting yet.
const mockUserForDispute: User = {
    id: 'user3',
    name: 'Samuel Green',
    username: 'samgreen',
    email: 'samgreen@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    bannerUrl: 'https://placehold.co/1200x400.png',
    'data-ai-hint': 'person smiling',
    trustScore: 78,
    isVerified: false,
    bio: 'Exploring the intersection of technology and society. All opinions are my own.',
    nominations: 2,
    publicVotes: 450,
    followersCount: 0,
    followingCount: 0,
    createdAt: null as any,
  };
  
const mockOfficialForDispute: User = {
    id: 'clarityOfficial',
    name: 'Clarity Official',
    username: 'clarity',
    email: 'clarity@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    bannerUrl: 'https://placehold.co/1200x400.png',
    'data-ai-hint': 'shield logo',
    trustScore: 100,
    isVerified: true,
    bio: 'The official account for the Clarity platform. Promoting transparency and accountability.',
    nominations: 0,
    publicVotes: 0,
    followersCount: 0,
    followingCount: 0,
    createdAt: null as any,
};

const mockCommentAuthor: User = {
    id: 'user5',
    name: 'Emily Carter',
    username: 'emilycarter',
    email: 'emily@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    'data-ai-hint': 'woman artist',
    trustScore: 88,
    isVerified: false,
    bio: 'Artist, dreamer, and creator of things.',
    nominations: 8,
    publicVotes: 2100,
    followersCount: 0,
    followingCount: 0,
    createdAt: null as any,
}

export const mockDisputes: Dispute[] = [
  {
    id: 'dispute1',
    title: 'Dispute over "Speedy Shippers" report accuracy',
    description:
      'The company "Speedy Shippers" is disputing the report made by @samgreen, claiming the delivery was delayed due to weather conditions not mentioned in the report. They have provided shipping logs as evidence.',
    involvedParties: [mockUserForDispute, mockOfficialForDispute],
    createdAt: '1d',
    status: 'voting',
    commentsCount: 56,
    poll: {
      question: 'Whose account do you find more credible?',
      options: [
        { text: "@samgreen's report", votes: 102 },
        { text: "Speedy Shipper's rebuttal", votes: 45 },
        { text: 'Need more information', votes: 33 },
      ],
    },
    verdict: null,
    comments: [
    ],
  },
];

export const mockFlaggedContent: FlaggedContent[] = [
  {
    id: 'flag1',
    content:
      'This whole company is a scam, avoid at all costs! They are all criminals.',
    contentType: 'comment',
    author: mockUserForDispute,
    reason: 'Hate speech policy violation',
    flaggedAt: '1h ago',
  },
];

export const userActivity = [
  { date: 'Mon', signups: 5 },
  { date: 'Tue', signups: 7 },
  { date: 'Wed', signups: 4 },
  { date: 'Thu', signups: 8 },
  { date: 'Fri', signups: 12 },
  { date: 'Sat', signups: 15 },
  { date: 'Sun', signups: 10 },
];
