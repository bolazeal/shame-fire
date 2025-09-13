
import type { User, Post, Dispute, FlaggedContent, Comment, Conversation, Message, Video } from '@/lib/types';

const mockAdminUser: User = {
    id: 'user1',
    name: 'Alex Doe',
    username: 'alexdoe',
    email: 'alexdoe@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    'data-ai-hint': 'person smiling',
    bannerUrl: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1500&h=500&fit=crop',
    trustScore: 95,
    isVerified: true,
    isAdmin: true,
    bio: 'Platform admin. Keeping things fair and square.',
    nominations: 5,
    publicVotes: 250,
    followersCount: 1500,
    followingCount: 200,
    createdAt: new Date('2023-01-01T10:00:00Z').toISOString(),
    accountStatus: 'active',
};

const mockUser2: User = {
  id: 'user2',
  name: 'Jane Smith',
  username: 'janesmith',
  email: 'janesmith@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  'data-ai-hint': 'woman smiling',
  bannerUrl: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1500&h=500&fit=crop',
  trustScore: 85,
  isVerified: true,
  bio: 'Building products that matter. Founder @ TechStart. She/Her.',
  nominations: 10,
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
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  'data-ai-hint': 'person glasses',
  bannerUrl: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1500&h=500&fit=crop',
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
    avatarUrl: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=100&h=100&fit=crop',
    'data-ai-hint': 'shipping truck',
    bannerUrl: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=1500&h=500&fit=crop',
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
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
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

const mockBakeryOwner: User = {
    id: 'user6',
    name: 'The Good Loaf Bakery',
    username: 'goodloafbakery',
    email: 'hello@goodloaf.com',
    avatarUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=100&h=100&fit=crop',
    'data-ai-hint': 'bakery owner',
    trustScore: 92,
    isVerified: true,
    bio: 'Proudly serving the best bread in town since 2015. Community-focused, locally-sourced.',
    nominations: 15,
    publicVotes: 3200,
    followersCount: 1800,
    followingCount: 5,
    createdAt: new Date('2023-04-01T11:00:00Z').toISOString(),
    accountStatus: 'active',
};

const mockCommunityMember: User = {
    id: 'user7',
    name: 'Maria Garcia',
    username: 'mariag',
    email: 'maria@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop',
    'data-ai-hint': 'woman portrait',
    trustScore: 75,
    isVerified: false,
    bio: 'Local resident and food enthusiast.',
    nominations: 1,
    publicVotes: 150,
    followersCount: 45,
    followingCount: 80,
    createdAt: new Date('2023-06-22T14:00:00Z').toISOString(),
    accountStatus: 'active',
};

const mockTechCompany: User = {
    id: 'user8',
    name: 'TechSolutions LLC',
    username: 'techsolutions',
    email: 'support@techsolutions.llc',
    avatarUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=100&h=100&fit=crop',
    'data-ai-hint': 'modern office',
    bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1500&h=500&fit=crop',
    trustScore: 72,
    isVerified: true,
    bio: 'Innovative tech solutions for a modern world. 24/7 customer support.',
    nominations: 3,
    publicVotes: 1800,
    followersCount: 4500,
    followingCount: 10,
    createdAt: new Date('2022-11-15T10:00:00Z').toISOString(),
    accountStatus: 'active',
};


export const mockUsers = {
    user1: mockAdminUser,
    user2: mockUser2,
    user3: mockReportingUser,
    user4: mockDisputingUser,
    user5: mockCommenter,
    user6: mockBakeryOwner,
    user7: mockCommunityMember,
    user8: mockTechCompany
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
        mediaUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=400&fit=crop',
        'data-ai-hint': 'artisan bread',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 4,
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
    },
    {
        id: 'post5',
        type: 'post',
        author: mockUser2, // Jane Smith
        authorId: mockUser2.id,
        text: "Excited to announce our new project aimed at increasing transparency in local government spending. We'll be using public data to create visualizations that everyone can understand. Follow our journey! #OpenGov #DataForGood",
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        commentsCount: 8,
        reposts: 25,
        repostedBy: [],
        upvotes: 190,
        downvotes: 3,
        bookmarks: 15,
        bookmarkedBy: [],
        upvotedBy: [],
        downvotedBy: [],
    },
    {
        id: 'post6',
        type: 'report',
        author: mockCommunityMember, // Maria Garcia
        authorId: mockCommunityMember.id,
        entity: 'TechSolutions LLC',
        category: 'Customer Service',
        text: 'I bought a laptop from TechSolutions LLC and the screen cracked within a week with normal use. Their support team claims it\'s "user damage" and refuses to honor the warranty. The build quality is clearly not what they advertise. Here\'s a photo of the crack.',
        mediaUrl: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&h=400&fit=crop',
        'data-ai-hint': 'cracked laptop screen',
        mediaType: 'image',
        createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 18,
        reposts: 7,
        repostedBy: [],
        upvotes: 120,
        downvotes: 5,
        bookmarks: 9,
        bookmarkedBy: [],
        upvotedBy: [],
        downvotedBy: [],
        sentiment: { score: -0.9, biasDetected: false },
        summary: 'A customer reports that TechSolutions LLC is refusing to honor the warranty for a laptop with a cracked screen.',
    },
    {
        id: 'post7',
        type: 'endorsement',
        author: mockCommenter, // Emily Carter
        authorId: mockCommenter.id,
        entity: 'Alex Doe',
        category: 'Community Leadership',
        text: 'I want to give a shout-out to @alexdoe for their incredible work moderating this platform. They are always fair, transparent, and quick to respond to issues. It\'s their hard work that makes this community a safe place for important discussions. Thank you!',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 6,
        reposts: 15,
        repostedBy: [],
        upvotes: 210,
        downvotes: 1,
        bookmarks: 11,
        bookmarkedBy: [],
        upvotedBy: [],
        downvotedBy: [],
        sentiment: { score: 0.95, biasDetected: false },
        summary: 'A user commends Alex Doe for fair and effective platform moderation.',
    },
    {
        id: 'post8',
        type: 'post',
        author: mockUser2, // Jane Smith
        authorId: mockUser2.id,
        text: "Sharing a short clip from our team's volunteer day last weekend. It was great to give back and help clean up the local park. #volunteering #community",
        mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        mediaType: 'video',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 12,
        reposts: 18,
        repostedBy: [],
        upvotes: 150,
        downvotes: 2,
        bookmarks: 8,
        bookmarkedBy: [],
        upvotedBy: [],
        downvotedBy: [],
    },
    {
        id: 'post9',
        type: 'report',
        author: mockReportingUser, // Samuel Green
        authorId: mockReportingUser.id,
        entity: 'TechSolutions LLC',
        category: 'Product Quality',
        text: 'The new software update from @techsolutions bricked my device. The support documents are out of date and their support line just keeps disconnecting. This is the second time this has happened with one of their updates.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        commentsCount: 22,
        reposts: 18,
        repostedBy: [],
        upvotes: 230,
        downvotes: 8,
        bookmarks: 14,
        bookmarkedBy: [],
        upvotedBy: [],
        downvotedBy: [],
        sentiment: { score: -0.9, biasDetected: false },
        summary: 'A user reports that a software update from TechSolutions LLC rendered their device unusable and that customer support is unresponsive.',
    }
];

// --- Mock Comments ---
export const mockComments: { [key: string]: Comment[] } = {
  'post1': [
    {
        id: 'comment3',
        author: mockCommenter,
        text: "I agree! Their morning buns are the best.",
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        upvotes: 10,
        downvotes: 0,
    },
    {
        id: 'comment4',
        author: mockBakeryOwner,
        text: "Thank you so much for the kind words, Jane! It means the world to our team. We're so glad to be a part of this community.",
        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
        upvotes: 25,
        downvotes: 0,
    },
    {
        id: 'comment5',
        author: mockCommunityMember,
        text: "This is great to hear. Do you have gluten-free options?",
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        upvotes: 5,
        downvotes: 0,
    },
    {
        id: 'comment6',
        author: mockBakeryOwner,
        text: "Hi Maria! We do. We bake a gluten-free sourdough every morning, but it tends to sell out fast. You can call ahead to reserve a loaf!",
        createdAt: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(),
        upvotes: 8,
        downvotes: 0,
    },
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
  ],
  'post6': [
    {
      id: 'comment7',
      author: mockTechCompany,
      text: "We are sorry to hear about your experience. Please check your DMs so we can get more details and arrange a resolution for you.",
      createdAt: new Date(Date.now() - 1.4 * 24 * 60 * 60 * 1000).toISOString(),
      upvotes: 5,
      downvotes: 2,
    },
  ],
  'dispute1': [
      {
        id: 'd1_comm1',
        author: mockDisputingUser, // Speedy Shippers Inc.
        text: "As we stated, our logs show a regional weather delay which is outside of our control. The package is now out for delivery.",
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        upvotes: 12,
        downvotes: 5,
      },
      {
        id: 'd1_comm2',
        author: mockCommenter,
        text: "Weather delay or not, a week with no updates is poor communication.",
        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
        upvotes: 28,
        downvotes: 2,
      },
      {
        id: 'd1_comm3',
        author: mockAdminUser, // Alex Doe
        authorIsAdmin: true,
        text: "Moderator Note: We are reviewing the logs provided by Speedy Shippers. Community, please keep the discussion focused on the evidence presented. Personal attacks will be removed.",
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        upvotes: 40,
        downvotes: 0,
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
  {
    id: 'dispute3',
    originalPostId: 'post9',
    title: 'Dispute over "TechSolutions LLC" software update report',
    description:
      'TechSolutions LLC is disputing the claim by @samgreen that their software update "bricked" his device. They claim the user did not follow the installation instructions and have offered to repair the device free of charge as a gesture of goodwill.',
    involvedParties: [mockReportingUser, mockTechCompany],
    createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'voting',
    commentsCount: 0,
    poll: {
      question: 'Whose position is more reasonable?',
      options: [
        { text: "The user's report of a faulty update", votes: 55 },
        { text: "The company's claim of user error", votes: 89 },
        { text: 'Both sides have valid points', votes: 112 },
      ],
      voters: [],
    },
    verdict: null,
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
          { id: 'user1', name: 'Alex Doe', username: 'alexdoe', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' },
          { id: 'user2', name: 'Jane Smith', username: 'janesmith', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' }
      ],
      lastMessageText: "Sounds good, I'll review the PR now.",
      lastMessageTimestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      lastMessageSenderId: 'user1',
    },
    {
      id: 'convo2',
      participantIds: ['user1', 'user3'],
      participants: [
          { id: 'user1', name: 'Alex Doe', username: 'alexdoe', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' },
          { id: 'user3', name: 'Samuel Green', username: 'samgreen', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' }
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
          {
            id: 'msg_img_1',
            senderId: 'user2',
            text: 'Check out this design mockup!',
            mediaUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
            mediaType: 'image',
            createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
          },
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
      thumbnailUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1280&h=720&fit=crop',
      'data-ai-hint': 'business interview',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      duration: '1:00',
      channel: 'Shame TV',
      views: '1.2M views',
      uploadedAt: '2 days ago',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'video2',
      title: 'On the Ground: How "Green Co-op" is Cleaning Up Local Parks',
      description: 'A feel-good story about a local cooperative making a real difference in their community.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1599664223612-41d3b14243a4?w=1280&h=720&fit=crop',
      'data-ai-hint': 'volunteers park',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      duration: '0:15',
      channel: 'Shame TV',
      views: '450K views',
      uploadedAt: '5 days ago',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'video3',
      title: 'Exposed: The Truth Behind "Miracle Cure" Products',
      description: 'An investigative report into the misleading claims made by a popular wellness brand.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1280&h=720&fit=crop',
      'data-ai-hint': 'science laboratory',
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: '9:56',
      channel: 'Shame TV',
      views: '2.5M views',
      uploadedAt: '1 week ago',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'video4',
        title: 'Community Spotlight: The Local Bakery That Feeds the Homeless',
        description: 'Every day, "The Good Loaf Bakery" donates their unsold bread to local shelters. We tell their story.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1280&h=720&fit=crop',
        'data-ai-hint': 'bakery interior',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: '10:53',
        channel: 'Shame TV',
        views: '800K views',
        uploadedAt: '2 weeks ago',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    }
];
