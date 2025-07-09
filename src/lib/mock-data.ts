import type { User, Post, Dispute, FlaggedContent, Comment, Conversation, Message, Video } from '@/lib/types';

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

// --- Mock Posts ---
export const mockPosts: Post[] = [
    {
        id: 'post1',
        type: 'endorsement',
        author: mockUser2,
        authorId: mockUser2.id,
        entity: 'The Good Loaf Bakery',
        category: 'Community Service',
        text: "The Good Loaf Bakery is a local treasure! Not only is their sourdough the best in town, but they also donate all of their unsold bread to local shelters at the end of each day. It's inspiring to see a business with so much heart. I can't recommend them enough!",
        mediaUrl: 'https://placehold.co/600x400.png',
        'data-ai-hint': 'artisan bread',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 2,
        reposts: 12,
        repostedBy: [],
        upvotes: 156,
        downvotes: 2,
        bookmarks: 5,
        bookmarkedBy: [],
        upvotedBy: [],
        downvotedBy: [],
        sentiment: { score: 0.9, biasDetected: false },
        summary: 'The Good Loaf Bakery is praised for its excellent bread and for donating unsold products to local shelters daily.',
    },
    {
        id: 'post2',
        type: 'report',
        author: mockReportingUser,
        authorId: mockReportingUser.id,
        entity: 'Speedy Shippers Inc.',
        category: 'Delivery Service',
        text: "My package from Speedy Shippers was supposed to arrive last Tuesday, but it's now a week late with no updates. The tracking number shows it's been sitting in a local warehouse for days, and customer service has been completely unhelpful. This is unacceptable.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 2,
        reposts: 5,
        repostedBy: [],
        upvotes: 88,
        downvotes: 4,
        bookmarks: 2,
        bookmarkedBy: [],
        upvotedBy: [],
        downvotedBy: [],
        sentiment: { score: -0.8, biasDetected: false },
        summary: "A customer reports a significant delay and poor customer service from Speedy Shippers regarding a late package.",
    },
    {
        id: 'post3',
        type: 'post',
        author: mockAdminUser,
        authorId: mockAdminUser.id,
        text: "Just a reminder to everyone: keep discussions civil and report any content that violates our community guidelines. We're working hard to make this a safe and productive platform for everyone. #Community",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 15,
        reposts: 30,
        repostedBy: [],
        upvotes: 250,
        downvotes: 1,
        bookmarks: 10,
        bookmarkedBy: [],
        upvotedBy: [],
        downvotedBy: [],
    },
    {
        id: 'post4',
        type: 'report',
        author: mockReportingUser,
        authorId: mockReportingUser.id,
        postingAs: 'anonymous',
        entity: 'Downtown Parking Authority',
        category: 'Public Service',
        text: "The parking meters on Elm Street are completely broken. I've seen multiple people get tickets despite paying because the machines don't register the payment correctly. This feels like a predatory ticketing practice.",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 32,
        reposts: 55,
        repostedBy: [],
        upvotes: 412,
        downvotes: 12,
        bookmarks: 40,
        bookmarkedBy: [],
        upvotedBy: [],
        downvotedBy: [],
        sentiment: { score: -0.7, biasDetected: false, biasExplanation: 'The language is strong but describes a specific issue.' },
        summary: 'An anonymous user reports that broken parking meters on Elm Street are leading to unfair ticketing.',
    }
];

// --- Mock Comments ---
export const mockComments: { [key: string]: Comment[] } = {
  'post1': [
    {
        id: 'comment3',
        author: mockCommenter,
        text: "I agree! Their morning buns are the best.",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        upvotes: 10,
        downvotes: 0,
    }
  ],
  'post2': [
    {
      id: 'comment1',
      author: mockCommenter, // Emily Carter
      text: "I had a similar issue with them last month! They lost my package entirely and it took weeks to get a refund.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      upvotes: 15,
      downvotes: 0,
    },
    {
      id: 'comment2',
      author: mockDisputingUser, // Speedy Shippers Inc.
      text: "We sincerely apologize for the inconvenience. We are experiencing unprecedented delays. Please contact our support with your tracking number so we can resolve this for you.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      upvotes: 2,
      downvotes: 8,
    }
  ]
};

// --- Mock Data for Village Square (Disputes) ---
export const mockDisputes: Dispute[] = [
  {
    id: 'dispute1',
    originalPostId: 'post2',
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
  },
  {
    id: 'dispute2',
    originalPostId: 'post1',
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

// --- Mock Data for Messages ---
export const mockConversations: Conversation[] = [
    {
      id: 'convo1',
      participantIds: ['user1', 'user2'],
      participants: [
          { id: 'user1', name: 'Alex Doe', username: 'alexdoe', avatarUrl: 'https://placehold.co/100x100.png' },
          { id: 'user2', name: 'Jane Smith', username: 'janesmith', avatarUrl: 'https://placehold.co/100x100.png' }
      ],
      lastMessageText: "Sounds good, I'll review the PR now.",
      lastMessageTimestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      lastMessageSenderId: 'user1',
    },
    {
      id: 'convo2',
      participantIds: ['user1', 'user3'],
      participants: [
          { id: 'user1', name: 'Alex Doe', username: 'alexdoe', avatarUrl: 'https://placehold.co/100x100.png' },
          { id: 'user3', name: 'Samuel Green', username: 'samgreen', avatarUrl: 'https://placehold.co/100x100.png' }
      ],
      lastMessageText: "Can you check on that report for Speedy Shippers?",
      lastMessageTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      lastMessageSenderId: 'user3',
    }
  ];
  
  export const mockMessages: { [key: string]: Message[] } = {
      'convo1': [
          { id: 'msg1', senderId: 'user2', text: 'Hey Alex, did you see the latest numbers for user engagement?', createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
          { id: 'msg2', senderId: 'user1', text: "Just saw them, looking great! We should discuss the new moderation queue features.", createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
          { id: 'msg3', senderId: 'user1', text: "I'm about to push an update for it.", createdAt: new Date(Date.now() - 7 * 60 * 1000).toISOString() },
          { id: 'msg4', senderId: 'user2', text: "Perfect, let me know when it's up.", createdAt: new Date(Date.now() - 6 * 60 * 1000).toISOString() },
          { id: 'msg5', senderId: 'user1', text: "Sounds good, I'll review the PR now.", createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
      ],
      'convo2': [
          { id: 'msg6', senderId: 'user3', text: "Can you check on that report for Speedy Shippers?", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      ]
  };

  export const mockVideos: Video[] = [
    {
      id: 'video1',
      title: 'Interview with CEO of "Innovate Corp" on Recent Controversy',
      description: 'We sit down with the CEO to discuss the recent data breach and what they are doing to regain public trust.',
      thumbnailUrl: 'https://placehold.co/1280x720.png',
      'data-ai-hint': 'business interview',
      videoUrl: '#',
      duration: '25:10',
      channel: 'Shame or Shine TV',
      views: '1.2M views',
      uploadedAt: '2 days ago',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'video2',
      title: 'On the Ground: How "Green Co-op" is Cleaning Up Local Parks',
      description: 'A feel-good story about a local cooperative making a real difference in their community.',
      thumbnailUrl: 'https://placehold.co/1280x720.png',
      'data-ai-hint': 'volunteers park',
      videoUrl: '#',
      duration: '8:45',
      channel: 'Shame or Shine TV',
      views: '450K views',
      uploadedAt: '5 days ago',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'video3',
      title: 'Exposed: The Truth Behind "Miracle Cure" Products',
      description: 'An investigative report into the misleading claims made by a popular wellness brand.',
      thumbnailUrl: 'https://placehold.co/1280x720.png',
      'data-ai-hint': 'science laboratory',
      videoUrl: '#',
      duration: '18:22',
      channel: 'Shame or Shine TV',
      views: '2.5M views',
      uploadedAt: '1 week ago',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'video4',
        title: 'Community Spotlight: The Local Bakery That Feeds the Homeless',
        description: 'Every day, "The Good Loaf Bakery" donates their unsold bread to local shelters. We tell their story.',
        thumbnailUrl: 'https://placehold.co/1280x720.png',
        'data-ai-hint': 'bakery interior',
        videoUrl: '#',
        duration: '12:15',
        channel: 'Shame or Shine TV',
        views: '800K views',
        uploadedAt: '2 weeks ago',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    }
];
