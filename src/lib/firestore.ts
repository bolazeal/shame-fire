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
  deleteDoc,
  type FieldValue,
  type WhereFilterOp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import type { Post, User, Comment, FlaggedContent, Dispute, Poll } from './types';
import type { z } from 'zod';
import type { createPostFormSchema } from '@/components/create-post-form';
import { suggestTrustScore } from '@/ai/flows/suggest-trust-score';

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

  const userProfile: Omit<User, 'id' | 'createdAt'> & {
    createdAt: FieldValue;
  } = {
    name: firebaseUser.displayName || 'Anonymous User',
    username: (firebaseUser.email || 'user').split('@')[0],
    email: firebaseUser.email || '',
    avatarUrl: firebaseUser.photoURL || 'https://placehold.co/100x100.png',
    trustScore: 50,
    isVerified: false,
    isAdmin: false,
    bio: 'New user on Shame.',
    location: '',
    website: '',
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

// NOTE: This is a simplification for the demo. In a real app, you'd need a more robust
// way to link entities, as names are not guaranteed to be unique.
export const getUserByEntityName = async (entityName: string): Promise<User | null> => {
  if (!db) return null;
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('name', '==', entityName), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  return fromFirestore<User>(snapshot.docs[0]);
};


export const updateUserProfile = async (
  userId: string,
  data: Partial<User>
): Promise<void> => {
    if (!db) throw new Error('Firestore not initialized');
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
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
    batch.set(followingRef, {
      userId: targetUserId,
      timestamp: serverTimestamp(),
    });
    batch.set(followerRef, {
      userId: currentUserId,
      timestamp: serverTimestamp(),
    });
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
    author: {
      // Embed author data for reads
      id: author.id,
      name:
        postData.postingAs === 'verified'
          ? author.name
          : postData.postingAs === 'anonymous'
          ? 'Anonymous'
          : 'Whistleblower',
      username:
        postData.postingAs === 'verified'
          ? author.username
          : postData.postingAs === 'anonymous'
          ? 'anonymous'
          : 'whistleblower',
      avatarUrl:
        postData.postingAs === 'verified'
          ? author.avatarUrl
          : 'https://placehold.co/100x100.png',
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
    sentiment: (postData as any).sentiment,
    summary: (postData as any).summary,
    isEscalated: false,
  };

  const docRef = await addDoc(collection(db, 'posts'), newPost);

  // Update trust score of the entity being posted about
  if ((postData.type === 'report' || postData.type === 'endorsement') && postData.entity) {
    const sentiment = (postData as any).sentiment;
    if (sentiment) {
      const targetUser = await getUserByEntityName(postData.entity);
      if (targetUser && targetUser.id !== author.id) { // Prevent users from changing their own score
        try {
          const scoreResult = await suggestTrustScore({
            currentTrustScore: targetUser.trustScore,
            postType: postData.type,
            postSentimentScore: sentiment.sentimentScore,
          });

          if (scoreResult.newTrustScore !== targetUser.trustScore) {
            await updateUserProfile(targetUser.id, { trustScore: scoreResult.newTrustScore });
          }
        } catch (e) {
          console.error("Failed to suggest or update trust score:", e);
          // Don't block post creation if trust score update fails
        }
      }
    }
  }

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

export const addComment = async (
  postId: string,
  text: string,
  author: User
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');

  const commentRef = collection(db, `posts/${postId}/comments`);
  const postRef = doc(db, 'posts', postId);

  const newComment: Omit<Comment, 'id' | 'createdAt'> & {
    createdAt: FieldValue;
  } = {
    author: {
      id: author.id,
      name: author.name,
      username: author.username,
      avatarUrl: author.avatarUrl,
    },
    text,
    createdAt: serverTimestamp(),
    upvotes: 0,
    downvotes: 0,
  };

  await addDoc(commentRef, newComment);
  await updateDoc(postRef, {
    commentsCount: increment(1),
  });
};

export const getComments = async (postId: string): Promise<Comment[]> => {
  if (!db) return [];
  const commentsRef = collection(db, `posts/${postId}/comments`);
  const q = query(commentsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => fromFirestore<Comment>(doc));
};

// ADMIN & MODERATION functions
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

export const addFlaggedItemToQueue = async (
  item: Omit<FlaggedContent, 'id' | 'flaggedAt'>
) => {
  if (!db) throw new Error('Firestore not initialized');
  await addDoc(collection(db, 'flagged_content'), {
    ...item,
    flaggedAt: serverTimestamp(),
  });
};

export const removeFlaggedItem = async (flaggedItemId: string) => {
  if (!db) throw new Error('Firestore not initialized');
  await deleteDoc(doc(db, 'flagged_content', flaggedItemId));
};

export const approveFlaggedItem = async (item: FlaggedContent) => {
  if (!db) throw new Error('Firestore not initialized');
  // First, create the post from the flagged data
  const authorProfile = await getUserProfile(item.author.id);
  if (!authorProfile) throw new Error('Could not find author profile.');
  await createPost(item.postData, authorProfile);
  // Then, remove it from the moderation queue
  await removeFlaggedItem(item.id);
};

export const getActiveDisputes = async (): Promise<Dispute[]> => {
  if (!db) return [];
  // For simplicity, we fetch all and filter client-side.
  // In a real app, you'd query where status is 'open' or 'voting'.
  const disputesRef = collection(db, 'disputes');
  const q = query(
    disputesRef,
    where('status', '!=', 'closed'),
    orderBy('status'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => fromFirestore<Dispute>(doc));
};

// DISPUTE-related functions
export const createDispute = async (
  post: Post,
  disputingUser: User
): Promise<string> => {
  if (!db) throw new Error('Firestore not initialized');
  const batch = writeBatch(db);

  // 1. Create the new dispute document
  const disputeRef = doc(collection(db, 'disputes'));
  const authorProfile = await getUserProfile(post.authorId);
  if (!authorProfile) throw new Error('Original author profile not found');

  const newDispute: Omit<Dispute, 'id' | 'createdAt'> & {
    createdAt: FieldValue;
  } = {
    originalPostId: post.id,
    title: `Dispute over report against "${post.entity}"`,
    description: `This dispute was opened regarding the following report: "${post.text}"`,
    involvedParties: [authorProfile, disputingUser],
    createdAt: serverTimestamp(),
    status: 'open',
    commentsCount: 0,
    poll: {
      question: 'Whose account do you find more credible in this dispute?',
      options: [
        { text: `The original report by @${post.author.username}`, votes: 0 },
        { text: `The rebuttal by ${post.entity}`, votes: 0 },
        { text: 'Need more information', votes: 0 },
      ],
      voters: [],
    },
    verdict: null,
  };
  batch.set(disputeRef, newDispute);

  // 2. Mark the original post as escalated
  const postRef = doc(db, 'posts', post.id);
  batch.update(postRef, { isEscalated: true });

  await batch.commit();
  return disputeRef.id;
};

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
}

export const addDisputeComment = async (disputeId: string, text: string, author: User): Promise<void> => {
    if (!db) throw new Error('Firestore not initialized');
    const commentRef = collection(db, `disputes/${disputeId}/comments`);
    const disputeRef = doc(db, 'disputes', disputeId);

    const newComment: Omit<Comment, 'id' | 'createdAt'> & {createdAt: FieldValue} = {
        author: {
            id: author.id,
            name: author.name,
            username: author.username,
            avatarUrl: author.avatarUrl,
        },
        text,
        createdAt: serverTimestamp(),
        upvotes: 0,
        downvotes: 0,
    };
    
    const batch = writeBatch(db);
    batch.set(doc(commentRef), newComment);
    batch.update(disputeRef, { commentsCount: increment(1) });
    await batch.commit();
}

export const getDisputeComments = async (disputeId: string): Promise<Comment[]> => {
    if (!db) return [];
    const commentsRef = collection(db, `disputes/${disputeId}/comments`);
    const q = query(commentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => fromFirestore<Comment>(doc));
}

export const castVote = async (disputeId: string, poll: Poll, optionText: string, userId: string): Promise<void> => {
    if (!db) throw new Error('Firestore not initialized');
    const disputeRef = doc(db, 'disputes', disputeId);
    
    // Find the index of the option to update
    const optionIndex = poll.options.findIndex(opt => opt.text === optionText);
    if (optionIndex === -1) {
        throw new Error("Invalid poll option.");
    }

    // This is not a transaction, but it's okay for this demo.
    // In a production app, a transaction or a Cloud Function would be better
    // to prevent race conditions.
    const newOptions = poll.options.map((opt, index) => 
        index === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
    );
    
    await updateDoc(disputeRef, {
        'poll.options': newOptions,
        'poll.voters': arrayUnion(userId) // Add user to voters list
    });
}
