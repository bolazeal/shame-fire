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
  if (!data) return data;

  // Convert all Timestamps to ISO strings
  Object.keys(data).forEach((key) => {
    if (data[key] instanceof Timestamp) {
      data[key] = data[key].toDate().toISOString();
    }
  });

  return { id: doc.id, ...data } as T;
}

// USER-related functions (READ-ONLY)
export const getUserProfile = async (
  userId: string
): Promise<User | null> => {
  if (!isFirebaseConfigured) {
    return Object.values(mockUsers).find(u => u.id === userId) || null;
  }
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return fromFirestore<User>(userSnap);
  }
  return null;
};

export const getUserByEntityName = async (entityName: string): Promise<User | null> => {
  if (!isFirebaseConfigured) {
    return Object.values(mockUsers).find(u => u.name === entityName || u.username === entityName) || null;
  }
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('name', '==', entityName), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    const usernameQuery = query(usersRef, where('username', '==', entityName), limit(1));
    const usernameSnapshot = await getDocs(usernameQuery);
    if(usernameSnapshot.empty) {
        return null;
    }
    return fromFirestore<User>(usernameSnapshot.docs[0]);
  }
  return fromFirestore<User>(snapshot.docs[0]);
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

export const hasUserNominated = async (
  nominatorId: string,
  nominatedUserId: string
): Promise<boolean> => {
    if (!isFirebaseConfigured) return false;
  const nominationRef = doc(db, `users/${nominatedUserId}/nominators`, nominatorId);
  const docSnap = await getDoc(nominationRef);
  return docSnap.exists();
};

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
  filter: 'foryou' | 'posts' | 'reports' | 'endorsements'
): Promise<Post[]> => {
    if (!isFirebaseConfigured) {
        if (filter === 'foryou') {
            return mockPosts;
        }
        if (filter === 'posts') {
            return mockPosts.filter(p => p.type === 'post');
        }
        const type = filter.slice(0, -1);
        return mockPosts.filter(p => p.type === type);
    }
  const postsRef = collection(db, 'posts');
  let q;
  if (filter === 'foryou' || filter === 'posts') {
    q = query(postsRef, orderBy('createdAt', 'desc'), limit(20));
  } else {
    const type = filter.slice(0, -1);
    q = query(
      postsRef,
      where('type', '==', type),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => fromFirestore<Post>(doc));
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
        return userPosts.filter(p => p.type === type);
    }
  const postsRef = collection(db, 'posts');
  let q;

  if (filter === 'media') {
    q = query(
      postsRef,
      where('authorId', '==', userId),
      where('mediaUrl', '!=', undefined),
      where('mediaUrl', '!=', ''),
      orderBy('mediaUrl'),
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
  const postsRef = collection(db, 'posts');
  const q = query(
      postsRef, 
      where('category', '!=', null),
      orderBy('category'),
      orderBy('createdAt', 'desc'), 
      limit(100)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return [];

  const posts = snapshot.docs.map(doc => fromFirestore<Post>(doc));
  const categoryCounts = new Map<string, number>();
  for (const post of posts) {
      if (post.category) {
          categoryCounts.set(post.category, (categoryCounts.get(post.category) || 0) + 1);
      }
  }
  const sortedTrends = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

  return sortedTrends;
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
        return mockPosts.length;
    }
    return 0;
  }
  let q = query(collection(db, collectionName));
  if (field && op && value) {
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
        return mockDisputes.find(d => d.id === disputeId) || null;
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
        callback(mockDisputes.find(d => d.id === disputeId) || null);
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

export const listenToDisputeComments = (
    disputeId: string,
    callback: (comments: Comment[]) => void
  ): (() => void) => {
    if (!isFirebaseConfigured) {
        // In mock mode, dispute comments are not available in mockComments, so return empty
        callback([]);
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
    
    const usernameQuery = query(
        usersRef,
        where('username', '>=', searchText),
        where('username', '<=', searchText + '\uf8ff'),
        limit(5)
    );
    
    const nameQuery = query(
        usersRef,
        where('name', '>=', searchText),
        where('name', '<=', searchText + '\uf8ff'),
        limit(5)
    );

    const [usernameSnapshot, nameSnapshot] = await Promise.all([
        getDocs(usernameQuery),
        getDocs(nameQuery),
    ]);

    const usersMap = new Map<string, User>();
    usernameSnapshot.docs.forEach(doc => {
        const user = fromFirestore<User>(doc);
        usersMap.set(user.id, user);
    });
    nameSnapshot.docs.forEach(doc => {
        const user = fromFirestore<User>(doc);
        usersMap.set(user.id, user);
    });
    
    return Array.from(usersMap.values());
};

export const searchPosts = async (searchText: string): Promise<Post[]> => {
    if (!isFirebaseConfigured) {
        const lowerCaseQuery = searchText.toLowerCase();
        return mockPosts.filter(p => p.category?.toLowerCase().includes(lowerCaseQuery));
    }
    const postsRef = collection(db, 'posts');
    const categoryQuery = query(
        postsRef,
        where('category', '>=', searchText),
        where('category', '<=', searchText + '\uf8ff'),
        orderBy('category'),
        orderBy('createdAt', 'desc'),
        limit(10)
    );
    
    const snapshot = await getDocs(categoryQuery);
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
  const messagesRef = collection(db, `conversations/${conversationId}/messages`);
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => fromFirestore<Message>(doc));
    callback(messages);
  });

  return unsubscribe;
};