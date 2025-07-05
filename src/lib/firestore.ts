

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
  runTransaction,
  onSnapshot,
  type FieldValue,
  type WhereFilterOp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import type { Post, User, Comment, FlaggedContent, Dispute, Poll, Notification, Conversation, Message } from './types';
import type { z } from 'zod';
import type { createPostFormSchema } from '@/components/create-post-form';
import { suggestTrustScore } from '@/ai/flows/suggest-trust-score';
import { analyzeSentiment } from '@/ai/flows/analyze-sentiment';
import { generateEndorsementSummary } from '@/ai/flows/generate-endorsement-summary';

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

// USER-related functions
export const createUserProfile = async (
  firebaseUser: FirebaseUser,
  username: string
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');

  // Check if this will be the first user to determine admin status
  const usersCheckQuery = query(collection(db, 'users'), limit(1));
  const usersCheckSnapshot = await getDocs(usersCheckQuery);
  const isFirstUser = usersCheckSnapshot.empty;

  const userRef = doc(db, 'users', firebaseUser.uid);
  const usernameRef = doc(db, 'usernames', username.toLowerCase());

  try {
    await runTransaction(db, async (transaction) => {
      const usernameDoc = await transaction.get(usernameRef);
      if (usernameDoc.exists()) {
        // Throw a specific error message that the frontend can catch
        throw new Error('firestore/username-already-in-use');
      }

      const userProfile: Omit<User, 'id' | 'createdAt'> & {
        createdAt: FieldValue;
      } = {
        name: firebaseUser.displayName || 'Anonymous User',
        username: username,
        email: firebaseUser.email || '',
        avatarUrl: firebaseUser.photoURL || 'https://placehold.co/100x100.png',
        trustScore: 50,
        isVerified: false,
        isAdmin: isFirstUser, // Grant admin rights to the first user
        bio: 'New user on Shame.',
        location: '',
        website: '',
        nominations: 0,
        publicVotes: 0,
        followersCount: 0,
        followingCount: 0,
        createdAt: serverTimestamp(),
        accountStatus: 'active',
      };
      transaction.set(userRef, userProfile);
      transaction.set(usernameRef, { userId: firebaseUser.uid });
    });
  } catch (error: any) {
    // Re-throw the custom error to be handled by the UI
    if (error.message === 'firestore/username-already-in-use') {
      throw error;
    }
    console.error('Create user profile transaction failed: ', error);
    throw new Error('Failed to create user profile due to a server error.');
  }
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

export const updateUserAccountStatus = async (
  userId: string,
  status: 'active' | 'suspended' | 'banned'
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { accountStatus: status });
};

export const resetUserTrustScore = async (userId: string): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { trustScore: 50 });
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
  // Fetch top 5 users ordered by their trust score
  const q = query(usersRef, orderBy('trustScore', 'desc'), limit(5));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => fromFirestore<User>(doc));
};

export const nominateUserForMedal = async (
  nominatedUserId: string,
  nominatorId: string
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');

  const nominationRef = doc(db, `users/${nominatedUserId}/nominators`, nominatorId);
  const nominationSnap = await getDoc(nominationRef);
  if (nominationSnap.exists()) {
    throw new Error('You have already nominated this user.');
  }

  const batch = writeBatch(db);

  // Add to a subcollection to track who nominated
  batch.set(nominationRef, { timestamp: serverTimestamp() });

  // Increment the public count on the user's profile
  const userRef = doc(db, 'users', nominatedUserId);
  batch.update(userRef, { nominations: increment(1) });

  await batch.commit();
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

    // Create notification
    const sender = await getUserProfile(currentUserId);
    if (sender) {
      await createNotification({
        type: 'follow',
        recipientId: targetUserId,
        sender,
      });
    }
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
      isVerified: postData.postingAs === 'verified' ? author.isVerified : false,
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
    repostedBy: [],
    upvotes: 0,
    downvotes: 0,
    bookmarks: 0,
    bookmarkedBy: [],
    upvotedBy: [],
    downvotedBy: [],
    sentiment: (postData as any).sentiment,
    summary: (postData as any).summary,
    isEscalated: false,
  };

  const docRef = await addDoc(collection(db, 'posts'), newPost);

  // Check for mentions and create notifications
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const mentionedUsernames = [...new Set(Array.from(postData.text.matchAll(mentionRegex), m => m[1]))];

  if (mentionedUsernames.length > 0) {
    for (const username of mentionedUsernames) {
      try {
        const usernameRef = doc(db, 'usernames', username.toLowerCase());
        const usernameSnap = await getDoc(usernameRef);

        if (usernameSnap.exists()) {
            const recipientId = usernameSnap.data().userId;
            if (recipientId && recipientId !== author.id) {
                await createNotification({
                    type: 'mention',
                    recipientId: recipientId,
                    sender: author,
                    postId: docRef.id,
                    postText: postData.text
                });
            }
        }
      } catch (error) {
        console.error(`Failed to process mention for @${username}:`, error);
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

// TRENDS-related functions
export const getTrendingTopics = async (): Promise<{ category: string; count: number }[]> => {
  if (!db) return [];
  
  // Fetch recent posts (e.g., last 50) that have a category
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

  // Aggregate categories
  const categoryCounts = new Map<string, number>();
  for (const post of posts) {
      if (post.category) {
          categoryCounts.set(post.category, (categoryCounts.get(post.category) || 0) + 1);
      }
  }

  // Sort by count and take the top 5
  const sortedTrends = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

  return sortedTrends;
};


// INTERACTION functions
export const toggleRepost = async (
  userId: string,
  postId: string,
  isReposted: boolean
) => {
  if (!db) throw new Error('Firestore not initialized');
  const postRef = doc(db, 'posts', postId);
  if (isReposted) {
    await updateDoc(postRef, {
      repostedBy: arrayRemove(userId),
      reposts: increment(-1),
    });
  } else {
    await updateDoc(postRef, {
      repostedBy: arrayUnion(userId),
      reposts: increment(1),
    });
    // Create notification
    const post = await getPost(postId);
    const sender = await getUserProfile(userId);
    if (post && sender && post.authorId !== userId) {
        await createNotification({
            type: 'repost',
            recipientId: post.authorId,
            sender,
            postId: post.id,
            postText: post.text,
        });
    }
  }
};

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

export const toggleVoteOnPost = async (
  userId: string,
  postId: string,
  voteType: 'up' | 'down'
) => {
  if (!db) throw new Error('Firestore not initialized');
  const postRef = doc(db, 'posts', postId);

  // Get necessary data before the transaction
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) {
    throw 'Document does not exist!';
  }
  const postData = postSnap.data() as Post;

  let shouldSendNotification = false;

  // Transaction for atomic update
  await runTransaction(db, async (transaction) => {
    const freshPostDoc = await transaction.get(postRef);
    if (!freshPostDoc.exists()) {
      throw 'Document does not exist during transaction!';
    }
    const data = freshPostDoc.data() as Post;
    const isUpvoted = data.upvotedBy.includes(userId);
    const isDownvoted = data.downvotedBy.includes(userId);

    let updates: Record<string, any> = {};

    if (voteType === 'up') {
      if (isUpvoted) {
        // User is toggling off their upvote
        updates = {
          upvotedBy: arrayRemove(userId),
          upvotes: increment(-1),
        };
      } else {
        // User is adding an upvote. This is when we notify.
        shouldSendNotification = true;
        updates = {
          upvotedBy: arrayUnion(userId),
          upvotes: increment(1),
        };
        // If user had a downvote, remove it
        if (isDownvoted) {
          updates = {
            ...updates,
            downvotedBy: arrayRemove(userId),
            downvotes: increment(-1),
          };
        }
      }
    } else if (voteType === 'down') {
      // No notification for downvotes
      if (isDownvoted) {
        // User is toggling off their downvote
        updates = {
          downvotedBy: arrayRemove(userId),
          downvotes: increment(-1),
        };
      } else {
        // User is adding a downvote
        updates = {
          downvotedBy: arrayUnion(userId),
          downvotes: increment(1),
        };
        // If user had an upvote, remove it
        if (isUpvoted) {
          updates = {
            ...updates,
            upvotedBy: arrayRemove(userId),
            upvotes: increment(-1),
          };
        }
      }
    }

    transaction.update(postRef, updates);
  });

  // Create notification outside the transaction if needed
  if (shouldSendNotification && postData.authorId !== userId) {
    const sender = await getUserProfile(userId);
    if (sender) {
      await createNotification({
        type: 'upvote',
        recipientId: postData.authorId,
        sender,
        postId: postId,
        postText: postData.text,
      });
    }
  }
};


export const addComment = async (
  postId: string,
  postAuthorId: string,
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

  // Create notification for post author
  if (author.id !== postAuthorId) {
    const post = await getPost(postId);
    if(post) {
        await createNotification({
            type: 'comment',
            recipientId: postAuthorId,
            sender: author,
            postId,
            postText: post.text,
        });
    }
  }
};

export const getComments = async (postId: string): Promise<Comment[]> => {
  if (!db) return [];
  const commentsRef = collection(db, `posts/${postId}/comments`);
  const q = query(commentsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => fromFirestore<Comment>(doc));
};

// NOTIFICATION functions
export const createNotification = async (
  data: Omit<Notification, 'id' | 'createdAt' | 'read'>
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  // Prevent users from notifying themselves
  if (data.sender.id === data.recipientId) {
    return;
  }
  const notificationRef = collection(db, `users/${data.recipientId}/notifications`);
  const newNotification: Omit<Notification, 'id' | 'createdAt'> & {
    createdAt: FieldValue;
  } = {
    ...data,
    sender: {
        id: data.sender.id,
        name: data.sender.name,
        username: data.sender.username,
        avatarUrl: data.sender.avatarUrl,
    },
    read: false,
    createdAt: serverTimestamp(),
  };
  await addDoc(notificationRef, newNotification);
};


export const getNotifications = async (userId: string): Promise<Notification[]> => {
  if (!db) return [];
  const ref = collection(db, `users/${userId}/notifications`);
  const q = query(ref, orderBy('createdAt', 'desc'), limit(50));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => fromFirestore<Notification>(doc));
};


export const markNotificationAsRead = async (userId: string, notificationId: string): Promise<void> => {
    if (!db) throw new Error('Firestore not initialized');
    const notificationRef = doc(db, `users/${userId}/notifications`, notificationId);
    await updateDoc(notificationRef, { read: true });
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const batch = writeBatch(db);
  const ref = collection(db, `users/${userId}/notifications`);
  const q = query(ref, where('read', '==', false));
  const snapshot = await getDocs(q);
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { read: true });
  });
  await batch.commit();
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
  
  const postData = { ...item.postData };
  
  // Re-run AI analysis during approval to get sentiment and summary
  if (postData.type !== 'post') {
      const sentimentResult = await analyzeSentiment({ text: postData.text });
      const summaryResult = await generateEndorsementSummary({ endorsementText: postData.text });
      (postData as any).sentiment = sentimentResult;
      (postData as any).summary = summaryResult.summary;
  }
  
  await createPost(postData, authorProfile);

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
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => fromFirestore<Comment>(doc));
}

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

export const addVerdictToDispute = async (
  disputeId: string,
  decision: string,
  reason: string,
  moderator: User
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  const disputeRef = doc(db, 'disputes', disputeId);

  const verdict = {
    moderator: {
        id: moderator.id,
        name: moderator.name,
        username: moderator.username,
        avatarUrl: moderator.avatarUrl,
        // We only embed the necessary fields to avoid data duplication
    },
    decision,
    reason,
  };

  await updateDoc(disputeRef, {
    verdict: verdict,
    status: 'closed',
  });
};

// SEARCH-related functions
export const searchUsers = async (searchText: string): Promise<User[]> => {
    if (!db) return [];
    const usersRef = collection(db, 'users');
    
    // Firestore doesn't support case-insensitive or full-text search natively.
    // This is a common workaround for prefix matching.
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

    // As with users, true full-text search requires a dedicated search service.
    // For this demo, we will search for posts where the category matches the search text
    // as a prefix. This demonstrates the concept.
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

// MESSAGE-related functions
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

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  text: string
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');

  const conversationRef = doc(db, 'conversations', conversationId);
  const messageRef = doc(collection(conversationRef, 'messages'));

  const batch = writeBatch(db);

  const newMessage: Omit<Message, 'id' | 'createdAt'> & {
    createdAt: FieldValue;
  } = {
    senderId,
    text,
    createdAt: serverTimestamp(),
  };
  batch.set(messageRef, newMessage);

  batch.update(conversationRef, {
    lastMessageText: text,
    lastMessageSenderId: senderId,
    lastMessageTimestamp: serverTimestamp(),
  });

  await batch.commit();
};
