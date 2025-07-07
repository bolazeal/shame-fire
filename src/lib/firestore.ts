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
} from 'firebase/firestore';
import { db } from './firebase';
import type { Post, User, Comment, FlaggedContent, Dispute, Conversation, Video, Message } from './types';

// Helper to convert Firestore doc to a serializable object
export function fromFirestore<T>(doc): T {
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
  if (!db) return null;
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return fromFirestore<User>(userSnap);
  }
  return null;
};

export const getUserByEntityName = async (entityName: string): Promise<User | null> => {
  if (!db) return null;
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
  currentUserId: string
): Promise<User[]> => {
  if (!db) return [];
  const usersRef = collection(db, 'users');
  // A more sophisticated algorithm would be needed for a real app
  const q = query(usersRef, where('id', '!=', currentUserId), limit(10));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => fromFirestore<User>(doc))
    .slice(0, 5);
};

export const getAllUsers = async (): Promise<User[]> => {
  if (!db) return [];
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => fromFirestore<User>(doc));
};

export const getHonourRollUsers = async (): Promise<User[]> => {
  if (!db) return [];
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('trustScore', 'desc'), limit(5));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => fromFirestore<User>(doc));
};

export const hasUserNominated = async (
  nominatorId: string,
  nominatedUserId: string
): Promise<boolean> => {
  if (!db) return false;
  const nominationRef = doc(db, `users/${nominatedUserId}/nominators`, nominatorId);
  const docSnap = await getDoc(nominationRef);
  return docSnap.exists();
};

export const hasUserNominatedForModerator = async (
  nominatorId: string,
  nominatedUserId: string
): Promise<boolean> => {
  if (!db) return false;
  const nominationRef = doc(db, `users/${nominatedUserId}/moderatorNominators`, nominatorId);
  const docSnap = await getDoc(nominationRef);
  return docSnap.exists();
};

export const isFollowing = async (
  currentUserId: string,
  targetUserId: string
): Promise<boolean> => {
  if (!db) return false;
  const followDocRef = doc(
    db,
    `users/${currentUserId}/following/${targetUserId}`
  );
  const docSnap = await getDoc(followDocRef);
  return docSnap.exists();
};


// POST-related functions (READ-ONLY)
export const getPosts = async (
  filter: 'foryou' | 'posts' | 'reports' | 'endorsements'
): Promise<Post[]> => {
  if (!db) return [];
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
  if (!db) return [];
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
  if (!db) return null;
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  if (postSnap.exists()) {
    return fromFirestore<Post>(postSnap);
  }
  return null;
};

export const getBookmarkedPosts = async (userId: string): Promise<Post[]> => {
  if (!db) return [];
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
    if (!db) return [];
    const commentsRef = collection(db, `posts/${postId}/comments`);
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => fromFirestore<Comment>(doc));
};

// TRENDS-related functions
export const getTrendingTopics = async (): Promise<{ category: string; count: number }[]> => {
  if (!db) return [];
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
  if (!db) return 0;
  let q = query(collection(db, collectionName));
  if (field && op && value) {
    q = query(q, where(field, op, value));
  }
  const snapshot = await getDocs(q);
  return snapshot.size;
};

export const getFlaggedContent = async (): Promise<FlaggedContent[]> => {
  if (!db) return [];
  const contentRef = collection(db, 'flagged_content');
  const q = query(contentRef, orderBy('flaggedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => fromFirestore<FlaggedContent>(doc));
};

// DISPUTE-related functions (READ-ONLY & LISTENERS)
export const getAllDisputes = async (): Promise<Dispute[]> => {
    if (!db) return [];
    const disputesRef = collection(db, 'disputes');
    const q = query(disputesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => fromFirestore<Dispute>(doc));
};

export const getDispute = async (disputeId: string): Promise<Dispute | null> => {
    if (!db) return null;
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
    if (!db) return () => {};
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
    if (!db) return () => {};
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
    if (!db) return [];
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
    if (!db) return [];
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
    if (!db) return [];
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, orderBy('createdAt', 'desc'), limit(20));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => fromFirestore<Video>(doc));
};

// MESSAGE-related functions (LISTENERS)
export const getConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
): (() => void) => {
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
  });

  return unsubscribe;
};

export const getMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  if (!db) return () => {};
  const messagesRef = collection(db, `conversations/${conversationId}/messages`);
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => fromFirestore<Message>(doc));
    callback(messages);
  });

  return unsubscribe;
};

export async function sendMessage(conversationId: string, senderId: string, text: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const messagesRef = collection(db, `conversations/${conversationId}/messages`);
    const conversationRef = doc(db, 'conversations', conversationId);

    const batch = getDoc(db).firestore.batch();

    batch.set(doc(messagesRef), {
        senderId,
        text,
        createdAt: serverTimestamp(),
    });

    batch.update(conversationRef, {
        lastMessageText: text,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: senderId,
    });
    
    await batch.commit();
}
