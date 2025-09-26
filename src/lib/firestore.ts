

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  type WhereFilterOp,
  DocumentSnapshot,
  startAfter,
  collectionGroup,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { Post, User, Comment, FlaggedContent, Dispute, Conversation, Video, Message } from './types';
import {
    mockComments,
    mockConversations,
    mockDisputes,
    mockFlaggedContent,
    mockMessages,
    mockPosts,
    mockUsers,
    mockVideos
  } from './mock-data';
import { getUserSuggestions } from './suggestions';

// Helper to convert Firestore doc to a serializable object
export function fromFirestore<T>(doc: DocumentSnapshot): T {
  const data = doc.data();
  if (!data) return data as T;

  // Convert all Timestamps to ISO strings
  Object.keys(data).forEach((key) => {
    if (data[key] instanceof Timestamp) {
      data[key] = data[key].toDate().toISOString();
    } else if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
        // Recursively check for nested Timestamps
        Object.keys(data[key]).forEach(subKey => {
            if (data[key][subKey] instanceof Timestamp) {
                data[key][subKey] = data[key][subKey].toDate().toISOString();
            }
        });
    }
  });

  return { id: doc.id, ...data } as T;
}

// USER-related functions (READ-ONLY)
export const getUserProfile = async (
  userId: string
): Promise<User | null> => {
  if (!isFirebaseConfigured) {
    const user = Object.values(mockUsers).find(u => u.id === userId || u.username === userId) || null;
    return user;
  }
  
  // In a real app, you might have separate lookups for ID vs username.
  // For this app, we'll try both.
  let userSnap = await getDoc(doc(db, 'users', userId));
  
  if (userSnap.exists()) {
    return fromFirestore<User>(userSnap);
  }

  // If not found by ID, try by username
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', userId), limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return fromFirestore<User>(snapshot.docs[0]);
  }

  return null;
};

export const getUserByUsername = async (username: string): Promise<User | null> => {
  if (!isFirebaseConfigured) {
    return Object.values(mockUsers).find(u => u.username === username) || null;
  }
  const usernamesRef = doc(db, 'usernames', username.toLowerCase());
  const usernameSnap = await getDoc(usernamesRef);
  if (usernameSnap.exists()) {
    const { userId } = usernameSnap.data();
    return getUserProfile(userId);
  }
  return null;
};

export const getUserByEntityName = async (entityName: string): Promise<User | null> => {
  if (!isFirebaseConfigured) {
    return Object.values(mockUsers).find(u => u.name === entityName || u.username === entityName) || null;
  }
  
  const userByUsername = await getUserByUsername(entityName);
  if (userByUsername) {
    return userByUsername;
  }
  
  const usersRef = collection(db, 'users');
  const nameQuery = query(usersRef, where('name', '==', entityName), limit(1));
  const nameSnapshot = await getDocs(nameQuery);
  if(!nameSnapshot.empty) {
    return fromFirestore<User>(nameSnapshot.docs[0]);
  }

  return null;
};

export const getUsersToFollow = async (
  currentUserId: string,
  count: number = 5
): Promise<User[]> => {
    if (!isFirebaseConfigured) {
        return Object.values(mockUsers).filter(u => u.id !== currentUserId).slice(0, count);
    }
    // This now uses the advanced suggestion system
    return await getUserSuggestions(currentUserId, count);
};

export const getAllUsers = async (): Promise<User[]> => {
    if (!isFirebaseConfigured) {
        return Object.values(mockUsers);
    }
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => fromFirestore<User>(doc));
};

export const getHonourRollUsers = async (): Promise<User[]> => {
    if (!isFirebaseConfigured) {
        return Object.values(mockUsers).sort((a, b) => b.trustScore - a.trustScore).slice(0, 5);
    }
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('trustScore', 'desc'), limit(5));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => fromFirestore<User>(doc));
};

export const getShameRollUsers = async (): Promise<User[]> => {
    if (!isFirebaseConfigured) {
        return Object.values(mockUsers).sort((a, b) => a.trustScore - b.trustScore).slice(0, 5);
    }
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('trustScore', 'asc'), limit(5));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => fromFirestore<User>(doc));
};

export const hasUserNominated = async (
  nominatorId: string,
  nominatedUserId: string,
  medalTitle: string
): Promise<boolean> => {
    if (!isFirebaseConfigured) return false;
    const nominationId = `${nominatorId}_${medalTitle.replace(/\s+/g, '_')}`;
    const nominationRef = doc(db, `users/${nominatedUserId}/medalNominations`, nominationId);
    const docSnap = await getDoc(nominationRef);
    return docSnap.exists();
};

export const getUserNominations = async (
  userId: string
): Promise<{ medalTitle: string, nominatorId: string }[]> => {
  if (!isFirebaseConfigured) return [];
  const nominationsRef = collection(db, `users/${userId}/medalNominations`);
  const snapshot = await getDocs(nominationsRef);
  return snapshot.docs.map(doc => doc.data() as { medalTitle: string, nominatorId: string });
}


export const hasUserNominatedForModerator = async (
  nominatorId: string,
  nominatedUserId: string
): Promise<boolean> => {
    if (!isFirebaseConfigured) return false;
  const nominationRef = doc(db, `users/${nominatedUserId}/moderatorNominators`, nominatorId);
  const docSnap = await getDoc(nominationRef);
  return docSnap.exists();
};

export const isFollowing = async (
  currentUserId: string,
  targetUserId: string
): Promise<boolean> => {
    if (!isFirebaseConfigured) return false;
  const followDocRef = doc(
    db,
    `users/${currentUserId}/following/${targetUserId}`
  );
  const docSnap = await getDoc(followDocRef);
  return docSnap.exists();
};


export async function getFollowers(userId: string): Promise<User[]> {
  if (!isFirebaseConfigured) {
    // Mock implementation: return a slice of mock users who aren't the user.
    return Object.values(mockUsers).filter(u => u.id !== userId).slice(0, 2);
  }
  const followersRef = collection(db, `users/${userId}/followers`);
  const snapshot = await getDocs(followersRef);
  const followerIds = snapshot.docs.map(doc => doc.id);
  
  if (followerIds.length === 0) return [];

  const userPromises = followerIds.map(id => getUserProfile(id));
  const users = await Promise.all(userPromises);
  return users.filter((user): user is User => user !== null);
}

export async function getFollowing(userId: string): Promise<User[]> {
  if (!isFirebaseConfigured) {
    return Object.values(mockUsers).filter(u => u.id !== userId).slice(2, 4);
  }
  const followingRef = collection(db, `users/${userId}/following`);
  const snapshot = await getDocs(followingRef);
  const followingIds = snapshot.docs.map(doc => doc.id);

  if (followingIds.length === 0) return [];
  
  const userPromises = followingIds.map(id => getUserProfile(id));
  const users = await Promise.all(userPromises);
  return users.filter((user): user is User => user !== null);
}


// POST-related functions (READ-ONLY)
export const getPosts = async (
  options: {
    filter: 'foryou' | 'posts' | 'reports' | 'endorsements';
    userId?: string;
    startAfter?: DocumentSnapshot;
    pageSize?: number;
  }
): Promise<{ posts: Post[]; lastVisible: DocumentSnapshot | null }> => {
    const { filter, userId, startAfter: startAfterDoc, pageSize = 10 } = options;

    if (!isFirebaseConfigured) {
        let mockData = mockPosts;
        if (filter === 'foryou' && userId) {
            // Mock following logic
            const followingIds = ['user2', 'user3'];
            mockData = mockPosts.filter(p => followingIds.includes(p.authorId));
        } else if (filter !== 'foryou' && filter !== 'posts') {
            const type = filter.slice(0, -1);
            mockData = mockPosts.filter(p => p.type === type);
        }
        return { posts: mockData.slice(0, pageSize), lastVisible: null };
    }
  
    const postsRef = collection(db, 'posts');
    let queryConstraints: any[] = [];
  
    // Base ordering
    queryConstraints.push(orderBy('createdAt', 'desc'));
  
    // Filtering
    if (filter === 'foryou' && userId) {
        const following = await getFollowing(userId);
        const followingIds = following.map(u => u.id);
        
        if (followingIds.length > 0) {
            // Firestore 'in' queries are limited to 30 items in a disjunction.
            // For larger lists, you'd need a more complex data model (e.g., a feed subcollection).
            // For this app, we'll assume a user follows a reasonable number of people.
            queryConstraints.push(where('authorId', 'in', followingIds.slice(0, 30)));
        } else {
            // If user follows no one, return an empty feed
            return { posts: [], lastVisible: null };
        }
    } else if (filter !== 'foryou' && filter !== 'posts') {
      const type = filter.slice(0, -1);
      queryConstraints.push(where('type', '==', type));
    }
  
    // Pagination
    if (startAfterDoc) {
      queryConstraints.push(startAfter(startAfterDoc));
    }
  
    // Limit
    queryConstraints.push(limit(pageSize));
  
    const q = query(postsRef, ...queryConstraints);
    const snapshot = await getDocs(q);
  
    const posts = snapshot.docs.map((doc) => fromFirestore<Post>(doc));
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
  
    return { posts, lastVisible };
  };

export const getUserPosts = async (
  userId: string,
  filter: string
): Promise<Post[]> => {
    if (!isFirebaseConfigured) {
        const userPosts = mockPosts.filter(p => p.authorId === userId);
        if (filter === 'media') {
            return userPosts.filter(p => p.mediaUrl);
        }
        const type = filter.endsWith('s') ? filter.slice(0, -1) : filter;
        if (type === 'post') {
            return userPosts.filter(p => p.type === 'post' || !p.type); // Handle old mock data
        }
        return userPosts.filter(p => p.type === type);
    }
  const postsRef = collection(db, 'posts');
  let q;

  if (filter === 'media') {
    q = query(
      postsRef,
      where('authorId', '==', userId),
      where('mediaUrl', '!=', null),
      orderBy('mediaUrl'), // Firestore requires an order by on the inequality field
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  } else {
    const type = filter.endsWith('s') ? filter.slice(0, -1) : filter;
    q = query(
      postsRef,
      where('authorId', '==', userId),
      where('type', '==', type),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => fromFirestore<Post>(doc));
};

export const getPost = async (postId: string): Promise<Post | null> => {
    if (!isFirebaseConfigured) {
        return mockPosts.find(p => p.id === postId) || null;
    }
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  if (postSnap.exists()) {
    return fromFirestore<Post>(postSnap);
  }
  return null;
};

export const getBookmarkedPosts = async (userId: string): Promise<Post[]> => {
    if (!isFirebaseConfigured) {
        // This is a simplification; in a real mock, we'd track bookmarks.
        return mockPosts.slice(0, 2);
    }
  const postsRef = collection(db, 'posts');
  const q = query(
    postsRef,
    where('bookmarkedBy', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => fromFirestore<Post>(doc));
};

export const getComments = async (postId: string): Promise<Comment[]> => {
    if (!isFirebaseConfigured) {
        return mockComments[postId] || [];
    }
    const commentsRef = collection(db, `posts/${postId}/comments`);
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => fromFirestore<Comment>(doc));
};

export async function getUserActivity(userId: string, activityType: 'upvotedBy' | 'repostedBy', count: number = 20): Promise<Post[]> {
  if (!isFirebaseConfigured) return [];

  const postsRef = collection(db, 'posts');
  const q = query(
    postsRef,
    where(activityType, 'array-contains', userId),
    orderBy('createdAt', 'desc'),
    limit(count)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirestore<Post>(doc));
}


// TRENDS-related functions
export const getTrendingTopics = async (): Promise<{ category: string; count: number }[]> => {
    if (!isFirebaseConfigured) {
        const categoryCounts = new Map<string, number>();
        for (const post of mockPosts) {
            if (post.category) {
                categoryCounts.set(post.category, (categoryCounts.get(post.category) || 0) + 1);
            }
        }
        return Array.from(categoryCounts.entries())
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }
    
    // In a real app, this would be done with a more scalable solution like a
    // separate aggregation service or Cloud Functions, as this query is inefficient.
    const postsRef = collection(db, 'posts');
    // Get posts from the last 7 days to calculate trends
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const q = query(
        postsRef,
        where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)),
        limit(500) // Limit reads for performance
    );
  
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];

    const categoryCounts = new Map<string, number>();
    for (const doc of snapshot.docs) {
        const post = fromFirestore<Post>(doc);
        if (post.category) {
            categoryCounts.set(post.category, (categoryCounts.get(post.category) || 0) + 1);
        }
    }
    
    return Array.from(categoryCounts.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
};


// ADMIN & MODERATION functions (READ-ONLY)
export const getCollectionCount = async (
  collectionName: string,
  field?: string,
  op?: WhereFilterOp,
  value?: any
): Promise<number> => {
  if (!isFirebaseConfigured) {
    if (collectionName === 'users') return Object.keys(mockUsers).length;
    if (collectionName === 'posts') {
        if (field === 'type' && value === 'report') return mockPosts.filter(p => p.type === 'report').length;
        if (field === 'type' && value === 'endorsement') return mockPosts.filter(p => p.type === 'endorsement').length;
        if (field === 'type' && value === 'post') return mockPosts.filter(p => p.type === 'post').length;
        return mockPosts.length;
    }
    return 0;
  }
  let q = query(collection(db, collectionName));
  if (field && op && value !== undefined) {
    q = query(q, where(field, op, value));
  }
  const snapshot = await getDocs(q);
  return snapshot.size;
};

export const getFlaggedContent = async (): Promise<FlaggedContent[]> => {
    if (!isFirebaseConfigured) {
        return mockFlaggedContent;
    }
  const contentRef = collection(db, 'flagged_content');
  const q = query(contentRef, orderBy('flaggedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => fromFirestore<FlaggedContent>(doc));
};

// DISPUTE-related functions (READ-ONLY & LISTENERS)
export const getAllDisputes = async (): Promise<Dispute[]> => {
    if (!isFirebaseConfigured) {
        return mockDisputes;
    }
    const disputesRef = collection(db, 'disputes');
    const q = query(disputesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => fromFirestore<Dispute>(doc));
};

export const getDispute = async (disputeId: string): Promise<Dispute | null> => {
    if (!isFirebaseConfigured) {
        const dispute = mockDisputes.find(d => d.id === disputeId) || null;
        return dispute;
    }
    const disputeRef = doc(db, 'disputes', disputeId);
    const disputeSnap = await getDoc(disputeRef);
    if (disputeSnap.exists()) {
        return fromFirestore<Dispute>(disputeSnap);
    }
    return null;
};

export const listenToDispute = (
    disputeId: string,
    callback: (dispute: Dispute | null) => void
  ): (() => void) => {
    if (!isFirebaseConfigured) {
        const dispute = mockDisputes.find(d => d.id === disputeId) || null;
        callback(dispute);
        return () => {}; // No-op unsubscribe for mock
    }
    const disputeRef = doc(db, 'disputes', disputeId);
  
    const unsubscribe = onSnapshot(disputeRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(fromFirestore<Dispute>(docSnap));
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Failed to listen to dispute ${disputeId}:`, error);
      callback(null);
    });
  
    return unsubscribe;
  };

export const getDisputeComments = async (disputeId: string): Promise<Comment[]> => {
    if (!isFirebaseConfigured) {
        return mockComments[disputeId] || [];
    }
    const commentsRef = collection(db, `disputes/${disputeId}/comments`);
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => fromFirestore<Comment>(doc));
};

export const listenToDisputeComments = (
    disputeId: string,
    callback: (comments: Comment[]) => void
  ): (() => void) => {
    if (!isFirebaseConfigured) {
        const comments = mockComments[disputeId] || [];
        callback(comments);
        return () => {};
    }
    const commentsRef = collection(db, `disputes/${disputeId}/comments`);
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newComments = snapshot.docs.map((doc) =>
        fromFirestore<Comment>(doc)
      );
      callback(newComments);
    }, (error) => {
      console.error(`Failed to listen to comments for dispute ${disputeId}:`, error);
      callback([]);
    });
  
    return unsubscribe;
  };

// SEARCH-related functions
export const searchUsers = async (searchText: string): Promise<User[]> => {
    if (!isFirebaseConfigured) {
        const lowerCaseQuery = searchText.toLowerCase();
        return Object.values(mockUsers).filter(u => 
            u.name.toLowerCase().includes(lowerCaseQuery) || 
            u.username.toLowerCase().includes(lowerCaseQuery)
        );
    }
    const usersRef = collection(db, 'users');
    
    // Firestore does not support case-insensitive search natively.
    // A common workaround is to store a lowercase version of the field.
    // For this app, we'll perform a basic prefix search.
    const q = query(
        usersRef,
        where('username', '>=', searchText),
        where('username', '<=', searchText + '\uf8ff'),
        limit(5)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => fromFirestore<User>(doc));
};

export const searchPosts = async (searchText: string): Promise<Post[]> => {
    if (!isFirebaseConfigured) {
        const lowerCaseQuery = searchText.toLowerCase();
        return mockPosts.filter(p => p.text.toLowerCase().includes(lowerCaseQuery) || p.category?.toLowerCase().includes(lowerCaseQuery));
    }
    
    const postsRef = collection(db, 'posts');
    const q = query(
        postsRef,
        where('keywords', 'array-contains', searchText.toLowerCase()),
        orderBy('createdAt', 'desc'),
        limit(20)
    );
    const snapshot = await getDocs(q);

    // This search is basic. A real app would use a dedicated search service
    // like Algolia or Elasticsearch for full-text search.
    // For now, we are just showing results based on an exact keyword match.
    // We could expand this to search categories or other fields if needed.
    return snapshot.docs.map(doc => fromFirestore<Post>(doc));
};

// VIDEO-related functions (READ-ONLY)
export const getVideos = async (): Promise<Video[]> => {
    if (!isFirebaseConfigured) {
        return mockVideos;
    }
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, orderBy('createdAt', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => fromFirestore<Video>(doc));
};

// MESSAGE-related functions (LISTENERS)
export const listenToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
): (() => void) => {
  if (!isFirebaseConfigured) {
    callback(mockConversations.filter(c => c.participantIds.includes(userId)));
    return () => {};
  }
  if (!db) return () => {};
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participantIds', 'array-contains', userId),
    orderBy('lastMessageTimestamp', 'desc')
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const conversations = snapshot.docs.map((doc) =>
      fromFirestore<Conversation>(doc)
    );
    callback(conversations);
  }, (error) => {
    console.error('Failed to listen for conversations:', error);
    callback([]);
  });

  return unsubscribe;
};

export const listenToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  if (!isFirebaseConfigured) {
    callback(mockMessages[conversationId] || []);
    return () => {};
  }
  if (!db) return () => {};
  const messagesRef = collection(db, `conversations/${conversationId}/messages`);
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => fromFirestore<Message>(doc));
    callback(messages);
  }, (error) => {
    console.error(`Failed to listen to messages for conversation ${conversationId}:`, error);
    callback([]);
  });

  return unsubscribe;
};
