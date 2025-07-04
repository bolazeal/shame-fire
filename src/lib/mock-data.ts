import type { User, Post, Dispute, FlaggedContent, Comment } from '@/lib/types';

const mockAdminUser: User = {
    id: 'user1',
    name: 'Alex Doe',
    username: 'alexdoe',
    email: 'alexdoe@example.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    'data-ai-hint': 'person smiling',
    bannerUrl: 'https://placehold.co/1200x400.png',
    trustScore: 95,
    isVerified: true,
    isAdmin: true,
    bio: 'Platform admin. Keeping things fair and square.',
    nominations: 0,
    publicVotes: 0,
    followersCount: 150,
    followingCount: 20,
    createdAt: new Date('2023-01-01T10:00:00Z').toISOString(),
    accountStatus: 'active',
};

const mockUser2: User = {
  id: 'user2',
  name: 'Jane Smith',
  username: 'janesmith',
  email: 'janesmith@example.com',
  avatarUrl: 'https://placehold.co/100x100.png',
  'data-ai-hint': 'woman smiling',
  bannerUrl: 'https://placehold.co/1200x400.png',
  trustScore: 85,
  isVerified: true,
  bio: 'Building products that matter. Founder @ TechStart. She/Her.',
  nominations: 5,
  publicVotes: 1200,
  followersCount: 1200,
  followingCount: 150,
  createdAt: new Date('2023-02-10T08:00:00Z').toISOString(),
  accountStatus: 'active',
};

const mockReportingUser: User = {
  id: 'user3',
  name: 'Samuel Green',
  username: 'samgreen',
  email: 'samgreen@example.com',
  avatarUrl: 'https://placehold.co/100x100.png',
  'data-ai-hint': 'person glasses',
  bannerUrl: 'https://placehold.co/1200x400.png',
  trustScore: 78,
  isVerified: false,
  bio: 'Exploring the intersection of technology and society. All opinions are my own.',
  nominations: 2,
  publicVotes: 450,
  followersCount: 88,
  followingCount: 120,
  createdAt: new Date('2023-05-15T12:30:00Z').toISOString(),
  accountStatus: 'active',
};

const mockDisputingUser: User = {
    id: 'user4',
    name: 'Speedy Shippers Inc.',
    username: 'speedyshippers',
    email: 'contact@speedyshippers.com',
    avatarUrl: 'https://placehold.co/100x100.png',
    'data-ai-hint': 'shipping truck',
    bannerUrl: 'https://placehold.co/1200x400.png',
    trustScore: 65,
    isVerified: true,
    bio: 'Official account for Speedy Shippers Inc. We deliver on time, every time.',
    nominations: 1,
    publicVotes: 950,
    followersCount: 2400,
    followingCount: 1,
    createdAt: new Date('2023-02-20T09:00:00Z').toISOString(),
    accountStatus: 'active',
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
    createdAt: new Date('2023-03-10T18:45:00Z').toISOString(),
    accountStatus: 'active',
};

export const mockUsers = {
    user1: mockAdminUser,
    user2: mockUser2,
    user3: mockReportingUser,
    user4: mockDisputingUser,
    user5: mockCommenter,
};


// --- Mock Data for Village Square (Disputes) ---
export const mockDisputes: Dispute[] = [
  {
    id: 'dispute1',
    originalPostId: 'post1',
    title: 'Dispute over "Speedy Shippers" report accuracy',
    description:
      'The company "Speedy Shippers" is disputing the report made by @samgreen, claiming the delivery was delayed due to weather conditions not mentioned in the report. They have provided shipping logs as evidence.',
    involvedParties: [mockReportingUser, mockDisputingUser],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'voting',
    commentsCount: 3,
    poll: {
      question: 'Whose account do you find more credible?',
      options: [
        { text: "@samgreen's report", votes: 102 },
        { text: "Speedy Shipper's rebuttal", votes: 45 },
        { text: 'Need more information', votes: 33 },
      ],
      voters: ['user5'],
    },
    verdict: null,
    comments: [
        { id: 'c1', author: { id: mockCommenter.id, name: mockCommenter.name, username: mockCommenter.username, avatarUrl: mockCommenter.avatarUrl }, text: "I've had issues with them before, they always have an excuse.", upvotes: 15, downvotes: 1, createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
        { id: 'c2', author: { id: mockAdminUser.id, name: mockAdminUser.name, username: mockAdminUser.username, avatarUrl: mockAdminUser.avatarUrl }, text: "Can Speedy Shippers provide tracking data that shows weather exceptions?", upvotes: 8, downvotes: 0, createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
        { id: 'c3', author: { id: mockDisputingUser.id, name: mockDisputingUser.name, username: mockDisputingUser.username, avatarUrl: mockDisputingUser.avatarUrl }, text: "Yes, we are compiling that information and will post an update shortly.", upvotes: 2, downvotes: 5, createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'dispute2',
    originalPostId: 'post2',
    title: 'Dispute regarding "Cafe Aroma" endorsement',
    description:
        'A user has disputed an endorsement for "Cafe Aroma", claiming it was a paid promotion and not a genuine experience. The original endorser denies this.',
    involvedParties: [mockCommenter, mockAdminUser],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'closed',
    commentsCount: 2,
    poll: {
      question: 'Do you believe the endorsement was genuine?',
      options: [
        { text: "Yes, it seems authentic", votes: 250 },
        { text: "No, it looks like an ad", votes: 180 },
      ],
      voters: ['user1', 'user2', 'user3'],
    },
    verdict: {
        moderator: {
            id: mockAdminUser.id,
            name: mockAdminUser.name,
            username: mockAdminUser.username,
            avatarUrl: mockAdminUser.avatarUrl,
        },
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
    postData: {
      type: 'post',
      postingAs: 'verified',
      text: 'This whole company is a scam, avoid at all costs! They are all criminals.',
    },
    author: mockReportingUser,
    reason: 'Hate speech policy violation',
    flaggedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'flag2',
    postData: {
      type: 'post',
      postingAs: 'verified',
      text: "Here is the CEO's home address, go let him know what you think: 123 Main St.",
    },
    author: mockCommenter,
    reason: 'Doxxing / Privacy violation',
    flaggedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
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

export const mockPosts: Post[] = []; // This is needed for ContentBreakdownChart but can be empty.
