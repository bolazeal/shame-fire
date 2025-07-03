import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  increment,
  arrayRemove,
  arrayUnion,
  updateDoc,
  type FieldValue,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import type { Post, User, Comment } from './types';
import { createPostFormSchema } from '@/components/create-post-form';
import type { z } from 'zod';

// Helper to convert Firestore doc to a serializable object
function fromFirestore<T>(doc): T {
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

// USER-related functions
export const createUserProfile = async (
  firebaseUser: FirebaseUser
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const userRef = doc(db, 'users', firebaseUser.uid);

  const userProfile: Omit<User, 'id' | 'createdAt'> & { createdAt: FieldValue } = {
    name: firebaseUser.displayName || 'Anonymous User',
    username: (firebaseUser.email || 'user').split('@')[0],
    email: firebaseUser.email || '',
    avatarUrl: firebaseUser.photoURL || 'https://placehold.co/100x100.png',
    trustScore: 50,
    isVerified: false,
    bio: 'New user on Shame.',
    nominations: 0,
    publicVotes: 0,
    followersCount: 0,
    followingCount: 0,
    createdAt: serverTimestamp(),
  };
  await setDoc(userRef, userProfile);
};

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

export const getUsersToFollow = async (
  currentUserId: string
): Promise<User[]> => {
  if (!db) return [];
  const usersRef = collection(db, 'users');
  // Firestore doesn't support inequality filters on different fields.
  // A simple way to get "other" users is to fetch a few and filter out the current user.
  // For a large-scale app, a more sophisticated approach would be needed.
  const q = query(usersRef, limit(10));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => fromFirestore<User>(doc))
    .filter((user) => user.id !== currentUserId)
    .slice(0, 5);
};


// FOLLOW-related functions
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

export const toggleFollow = async (
  currentUserId: string,
  targetUserId: string,
  isCurrentlyFollowing: boolean
) => {
  if (!db) throw new Error('Firestore not initialized');
  const batch = writeBatch(db);
  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetUserId);
  const followingRef = doc(db, `users/${currentUserId}/following`, targetUserId);
  const followerRef = doc(db, `users/${targetUserId}/followers`, currentUserId);

  if (isCurrentlyFollowing) {
    // Unfollow
    batch.delete(followingRef);
    batch.delete(followerRef);
    batch.update(currentUserRef, { followingCount: increment(-1) });
    batch.update(targetUserRef, { followersCount: increment(-1) });
  } else {
    // Follow
    batch.set(followingRef, { userId: targetUserId, timestamp: serverTimestamp() });
    batch.set(followerRef, { userId: currentUserId, timestamp: serverTimestamp() });
    batch.update(currentUserRef, { followingCount: increment(1) });
    batch.update(targetUserRef, { followersCount: increment(1) });
  }

  await batch.commit();
};

// POST-related functions
export const createPost = async (
  postData: z.infer<typeof createPostFormSchema>,
  author: User
): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  
  const newPost: Omit<Post, 'id' | 'createdAt'> & { createdAt: FieldValue } = {
    type: postData.type,
    author: { // Embed author data for reads
      id: author.id,
      name: postData.postingAs === 'verified' ? author.name : (postData.postingAs === 'anonymous' ? 'Anonymous' : 'Whistleblower'),
      username: postData.postingAs === 'verified' ? author.username : (postData.postingAs === 'anonymous' ? 'anonymous' : 'whistleblower'),
      avatarUrl: postData.postingAs === 'verified' ? author.avatarUrl : 'https://placehold.co/100x100.png',
    },
    authorId: author.id,
    postingAs: postData.postingAs,
    entity: postData.entity,
    text: postData.text,
    mediaUrl: postData.mediaUrl,
    mediaType: postData.mediaType,
    category: postData.category,
    createdAt: serverTimestamp(),
    commentsCount: 0,
    reposts: 0,
    upvotes: 0,
    downvotes: 0,
    bookmarks: 0,
    bookmarkedBy: [],
    sentiment: postData.sentiment,
    summary: postData.summary,
  };

  const docRef = await addDoc(collection(db, 'posts'), newPost);
  return docRef.id;
};

export const getPosts = async (
  filter: 'foryou' | 'posts' | 'reports' | 'endorsements'
): Promise<Post[]> => {
  if (!db) return [];
  const postsRef = collection(db, 'posts');
  let q;
  if (filter === 'foryou' || filter === 'posts') {
    q = query(postsRef, orderBy('createdAt', 'desc'), limit(20));
  } else {
    const type = filter.slice(0, -1); // 'reports' -> 'report'
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

export const getUserPosts = async (userId: string, filter: string): Promise<Post[]> => {
    if (!db) return [];
    const postsRef = collection(db, 'posts');
    let q;
    
    if (filter === "media") {
        q = query(postsRef, where('authorId', '==', userId), where('mediaUrl', '!=', undefined), where('mediaUrl', '!=', ''), orderBy('mediaUrl'), orderBy('createdAt', 'desc'), limit(20));
    } else {
        const type = filter.endsWith('s') ? filter.slice(0, -1) : filter;
        q = query(postsRef, where('authorId', '==', userId), where('type', '==', type), orderBy('createdAt', 'desc'), limit(20));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => fromFirestore<Post>(doc));
};

export const getPost = async (postId: string): Promise<Post | null> => {
    if (!db) return null;
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
        return fromFirestore<Post>(postSnap);
    }
    return null;
}

// INTERACTION functions
export const toggleBookmark = async (
  userId: string,
  postId: string,
  isBookmarked: boolean
) => {
  if (!db) throw new Error('Firestore not initialized');
  const postRef = doc(db, 'posts', postId);
  if (isBookmarked) {
    await updateDoc(postRef, {
      bookmarkedBy: arrayRemove(userId),
      bookmarks: increment(-1),
    });
  } else {
    await updateDoc(postRef, {
      bookmarkedBy: arrayUnion(userId),
      bookmarks: increment(1),
    });
  }
};

export const addComment = async (postId: string, text: string, author: User): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');

  const commentRef = collection(db, `posts/${postId}/comments`);
  const postRef = doc(db, 'posts', postId);

  const newComment: Omit<Comment, 'id' | 'createdAt'> & {createdAt: FieldValue} = {
      author: { // embed user data
          id: author.id,
          name: author.name,
          username: author.username,
          avatarUrl: author.avatarUrl,
          // We only embed a subset of the user object to avoid bloat
          bio: author.bio,
          trustScore: author.trustScore,
          isVerified: author.isVerified,
          email: author.email,
          nominations: author.nominations,
          publicVotes: author.publicVotes,
          followersCount: author.followersCount,
          followingCount: author.followingCount,
      },
      text,
      createdAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
  };

  await addDoc(commentRef, newComment);
  await updateDoc(postRef, {
      commentsCount: increment(1)
  });
};

export const getComments = async (postId: string): Promise<Comment[]> => {
  if (!db) return [];
  const commentsRef = collection(db, `posts/${postId}/comments`);
  const q = query(commentsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirestore<Comment>(doc));
};
