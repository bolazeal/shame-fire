import type { User, Post, Dispute, FlaggedContent, Comment } from '@/lib/types';
import type { Timestamp } from 'firebase/firestore';

// We are now transitioning to a hybrid model.
// Real user and post data will come from Firestore.
// Dispute and Moderation data will use this mock data temporarily
// until those features are fully migrated to Firestore.

// --- Mock Users for Disputes/Moderation ---
const mockAdminUser: User = {
    id: 'user1',
    name: 'Alex Doe',
    username: 'alexdoe',
    email: 'alexdoe@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    bannerUrl: 'https://placehold.co/1200x400.png',
    'data-ai-hint': 'person smiling',
    trustScore: 95,
    isVerified: true,
    bio: 'Platform admin. Keeping things fair and square.',
    nominations: 0,
    publicVotes: 0,
    followersCount: 150,
    followingCount: 20,
    createdAt: { toDate: () => new Date('2023-01-01T10:00:00Z') } as any,
};

const mockReportingUser: User = {
  id: 'user3',
  name: 'Samuel Green',
  username: 'samgreen',
  email: 'samgreen@example.com',
  avatarUrl: 'https://placehold.co/100x100.png',
  bannerUrl: 'https://placehold.co/1200x400.png',
  'data-ai-hint': 'person glasses',
  trustScore: 78,
  isVerified: false,
  bio: 'Exploring the intersection of technology and society. All opinions are my own.',
  nominations: 2,
  publicVotes: 450,
  followersCount: 88,
  followingCount: 120,
  createdAt: { toDate: () => new Date('2023-05-15T12:30:00Z') } as any,
};

const mockDisputingUser: User = {
    id: 'user4',
    name: 'Speedy Shippers Inc.',
    username: 'speedyshippers',
    email: 'contact@speedyshippers.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    bannerUrl: 'https://placehold.co/1200x400.png',
    'data-ai-hint': 'shipping truck',
    trustScore: 65,
    isVerified: true,
    bio: 'Official account for Speedy Shippers Inc. We deliver on time, every time.',
    nominations: 1,
    publicVotes: 950,
    followersCount: 2400,
    followingCount: 1,
    createdAt: { toDate: () => new Date('2023-02-20T09:00:00Z') } as any,
};

const mockCommenter: User = {
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
    followersCount: 560,
    followingCount: 300,
    createdAt: { toDate: () => new Date('2023-03-10T18:45:00Z') } as any,
}


// --- Mock Data for Village Square (Disputes) ---
export const mockDisputes: Dispute[] = [
  {
    id: 'dispute1',
    originalPostId: 'post1',
    title: 'Dispute over "Speedy Shippers" report accuracy',
    description:
      'The company "Speedy Shippers" is disputing the report made by @samgreen, claiming the delivery was delayed due to weather conditions not mentioned in the report. They have provided shipping logs as evidence.',
    involvedParties: [mockReportingUser, mockDisputingUser],
    createdAt: { toDate: () => new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) } as any,
    status: 'voting',
    commentsCount: 3,
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
        { id: 'c1', author: mockCommenter, text: "I've had issues with them before, they always have an excuse.", upvotes: 15, downvotes: 1, createdAt: { toDate: () => new Date(Date.now() - 12 * 60 * 60 * 1000) } as any },
        { id: 'c2', author: mockAdminUser, text: "Can Speedy Shippers provide tracking data that shows weather exceptions?", upvotes: 8, downvotes: 0, createdAt: { toDate: () => new Date(Date.now() - 10 * 60 * 60 * 1000) } as any },
        { id: 'c3', author: mockDisputingUser, text: "Yes, we are compiling that information and will post an update shortly.", upvotes: 2, downvotes: 5, createdAt: { toDate: () => new Date(Date.now() - 9 * 60 * 60 * 1000) } as any },
    ],
  },
  {
    id: 'dispute2',
    originalPostId: 'post2',
    title: 'Dispute regarding "Cafe Aroma" endorsement',
    description:
        'A user has disputed an endorsement for "Cafe Aroma", claiming it was a paid promotion and not a genuine experience. The original endorser denies this.',
    involvedParties: [mockCommenter, mockAdminUser],
    createdAt: { toDate: () => new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) } as any,
    status: 'closed',
    commentsCount: 2,
    poll: {
      question: 'Do you believe the endorsement was genuine?',
      options: [
        { text: "Yes, it seems authentic", votes: 250 },
        { text: "No, it looks like an ad", votes: 180 },
      ],
    },
    verdict: {
        moderator: mockAdminUser,
        decision: "The endorsement is deemed promotional.",
        reason: "After review, evidence suggested a coordinated campaign. The endorsement has been flagged as sponsored content."
    },
    comments: [],
  },
];


// --- Mock Data for Admin Moderation Panel ---
export const mockFlaggedContent: FlaggedContent[] = [
  {
    id: 'flag1',
    originalPostId: 'post3',
    content:
      'This whole company is a scam, avoid at all costs! They are all criminals.',
    contentType: 'post',
    author: mockReportingUser,
    reason: 'Hate speech policy violation',
    flaggedAt: { toDate: () => new Date(Date.now() - 1 * 60 * 60 * 1000) } as any,
  },
  {
    id: 'flag2',
    originalPostId: 'post4',
    content:
      'Here is the CEO\'s home address, go let him know what you think: 123 Main St.',
    contentType: 'comment',
    author: mockCommenter,
    reason: 'Doxxing / Privacy violation',
    flaggedAt: { toDate: () => new Date(Date.now() - 5 * 60 * 60 * 1000) } as any,
  },
];


// --- Mock Data for Charts (Remains unchanged) ---
export const userActivity = [
  { date: 'Mon', signups: 5 },
  { date: 'Tue', signups: 7 },
  { date: 'Wed', signups: 4 },
  { date: 'Thu', signups: 8 },
  { date: 'Fri', signups: 12 },
  { date: 'Sat', signups: 15 },
  { date: 'Sun', signups: 10 },
];
