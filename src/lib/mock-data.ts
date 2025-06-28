import type { User, Post } from '@/lib/types';

export const mockUsers: Record<string, User> = {
  user1: {
    id: 'user1',
    name: 'Alex Doe',
    username: 'alexdoe',
    avatarUrl: 'https://placehold.co/100x100.png',
    'data-ai-hint': 'man portrait',
    trustScore: 85,
    isVerified: true,
  },
  user2: {
    id: 'user2',
    name: 'Jane Smith',
    username: 'janesmith',
    avatarUrl: 'https://placehold.co/100x100.png',
    'data-ai-hint': 'woman portrait',
    trustScore: 92,
    isVerified: true,
  },
  user3: {
    id: 'user3',
    name: 'Samuel Green',
    username: 'samgreen',
    avatarUrl: 'https://placehold.co/100x100.png',
    'data-ai-hint': 'person smiling',
    trustScore: 78,
    isVerified: false,
  },
  user4: {
    id: 'user4',
    name: 'Clarity Official',
    username: 'clarity',
    avatarUrl: '/clarity-logo.svg',
    trustScore: 100,
    isVerified: true,
  },
};

export const mockPosts: Post[] = [
  {
    id: 'post1',
    type: 'endorsement',
    author: mockUsers.user2,
    entity: 'The Local Cafe',
    text: "Just had the best customer service experience at The Local Cafe. The staff was incredibly friendly and helpful. Highly recommend their cortado!",
    category: 'Customer Service',
    createdAt: '2h',
    commentsCount: 12,
    likes: 45,
    shares: 5,
    sentiment: {
      score: 0.9,
      biasDetected: false,
    },
    summary: "A glowing review of The Local Cafe's customer service and coffee.",
  },
  {
    id: 'post2',
    type: 'report',
    author: mockUsers.user3,
    entity: 'Speedy Shippers',
    text: "My package from 'Speedy Shippers' arrived two weeks late and the box was damaged. Their tracking system was also down for the entire duration. Very frustrating experience.",
    mediaUrl: 'https://placehold.co/600x400.png',
    mediaType: 'image',
    category: 'Logistics',
    createdAt: '5h',
    commentsCount: 34,
    likes: 8,
    shares: 2,
    sentiment: {
      score: -0.8,
      biasDetected: false,
    },
  },
  {
    id: 'post3',
    type: 'endorsement',
    author: mockUsers.user1,
    entity: 'Productivity Pro App',
    text: "I want to give a shoutout to the developers of the 'Productivity Pro' app. The new update is fantastic, and it has genuinely improved my workflow. The UI is clean and intuitive.",
    category: 'Technology',
    createdAt: '1d',
    commentsCount: 5,
    likes: 78,
    shares: 12,
    sentiment: {
      score: 0.95,
      biasDetected: false,
    },
    summary: 'Positive feedback on the new update for the "Productivity Pro" app.'
  },
  {
    id: 'post4',
    type: 'report',
    author: mockUsers.user2,
    entity: 'Innovate Inc.',
    text: 'Attended a workshop by "Innovate Inc." and the content was completely outdated. The speaker seemed unprepared and couldn\'t answer basic questions. Not worth the price of admission.',
    category: 'Education',
    createdAt: '2d',
    commentsCount: 21,
    likes: 15,
    shares: 1,
    sentiment: {
      score: -0.7,
      biasDetected: true,
      biasExplanation: 'The language used is strong and subjective, which may indicate a personal bias against the company or speaker.'
    }
  }
];
