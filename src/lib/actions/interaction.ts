
'use server';

import {
  doc,
  writeBatch,
  increment,
  arrayRemove,
  arrayUnion,
  updateDoc,
  deleteDoc,
  runTransaction,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getPost, getUserProfile } from '@/lib/firestore';
import type { Post, Comment, Poll, User } from '@/lib/types';
import type { FieldValue } from 'firebase/firestore';
import { createNotification } from './notification';

export async function toggleFollowAction(
  currentUserId: string,
  targetUserId: string,
  isCurrentlyFollowing: boolean
) {
  if (!db) throw new Error('Firestore not initialized');
  const batch = writeBatch(db);
  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetUserId);
  const followingRef = doc(db, `users/${currentUserId}/following`, targetUserId);
  const followerRef = doc(db, `users/${targetUserId}/followers`, currentUserId);

  if (isCurrentlyFollowing) {
    batch.delete(followingRef);
    batch.delete(followerRef);
    batch.update(currentUserRef, { followingCount: increment(-1) });
    batch.update(targetUserRef, { followersCount: increment(-1) });
  } else {
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
}

export async function toggleRepostAction(
  userId: string,
  postId: string,
  isReposted: boolean
) {
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
}

export async function toggleBookmarkAction(
  userId: string,
  postId: string,
  isBookmarked: boolean
) {
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
}

export async function toggleVoteOnPostAction(
  userId: string,
  postId: string,
  voteType: 'up' | 'down'
) {
  if (!db) throw new Error('Firestore not initialized');
  const postRef = doc(db, 'posts', postId);

  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) {
    throw 'Document does not exist!';
  }
  const postData = postSnap.data() as Post;

  let shouldSendNotification = false;

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
        updates = {
          upvotedBy: arrayRemove(userId),
          upvotes: increment(-1),
        };
      } else {
        shouldSendNotification = true;
        updates = {
          upvotedBy: arrayUnion(userId),
          upvotes: increment(1),
        };
        if (isDownvoted) {
          updates = {
            ...updates,
            downvotedBy: arrayRemove(userId),
            downvotes: increment(-1),
          };
        }
      }
    } else if (voteType === 'down') {
      if (isDownvoted) {
        updates = {
          downvotedBy: arrayRemove(userId),
          downvotes: increment(-1),
        };
      } else {
        updates = {
          downvotedBy: arrayUnion(userId),
          downvotes: increment(1),
        };
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
}

export async function addCommentAction(
  postId: string,
  postAuthorId: string,
  commentData: {
    text: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
  },
  author: User
): Promise<void> {
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
    text: commentData.text,
    mediaUrl: commentData.mediaUrl,
    mediaType: commentData.mediaType,
    createdAt: serverTimestamp(),
    upvotes: 0,
    downvotes: 0,
  };

  const commentDocRef = await addDoc(commentRef, newComment);
  await updateDoc(postRef, {
    commentsCount: increment(1),
  });

  // Handle Mentions in comment
  const mentionRegex = /@(\w+)/g;
  const mentions = commentData.text.match(mentionRegex);
  const mentionedUserIds = new Set<string>();

  if (mentions) {
    const { getUserByUsername } = await import('@/lib/firestore');
    for (const mention of mentions) {
      const username = mention.substring(1);
      const mentionedUser = await getUserByUsername(username);
      if (mentionedUser && mentionedUser.id !== author.id) {
        mentionedUserIds.add(mentionedUser.id);
      }
    }
  }

  // Add post author to notification list (if not mentioned)
  if (author.id !== postAuthorId) {
      mentionedUserIds.add(postAuthorId);
  }
  
  // Send notifications
  const post = await getPost(postId);
  if (post) {
      for (const recipientId of mentionedUserIds) {
          const notificationType = recipientId === postAuthorId ? 'comment' : 'mention';
          await createNotification({
              type: notificationType,
              recipientId,
              sender: author,
              postId,
              postText: post.text,
          });
      }
  }
}

export async function deleteCommentAction(
  postId: string,
  commentId: string
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  const batch = writeBatch(db);
  const commentRef = doc(db, `posts/${postId}/comments`, commentId);
  batch.delete(commentRef);

  const postRef = doc(db, 'posts', postId);
  batch.update(postRef, { commentsCount: increment(-1) });

  await batch.commit();
}


export async function addDisputeCommentAction(
    disputeId: string,
    text: string,
    author: User
  ): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    const commentRef = collection(db, `disputes/${disputeId}/comments`);
    const disputeRef = doc(db, 'disputes', disputeId);
  
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
  
    const batch = writeBatch(db);
    batch.set(doc(commentRef), newComment);
    batch.update(disputeRef, { commentsCount: increment(1) });
    await batch.commit();
  }

  export async function deleteDisputeCommentAction(
    disputeId: string,
    commentId: string
  ): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    const batch = writeBatch(db);
  
    const commentRef = doc(db, `disputes/${disputeId}/comments`, commentId);
    batch.delete(commentRef);
  
    const disputeRef = doc(db, 'disputes', disputeId);
    batch.update(disputeRef, { commentsCount: increment(-1) });
  
    await batch.commit();
  }

  export async function castVoteAction(
    disputeId: string,
    optionText: string,
    userId: string
  ): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    const disputeRef = doc(db, 'disputes', disputeId);
    
    await runTransaction(db, async (transaction) => {
        const disputeDoc = await transaction.get(disputeRef);
        if (!disputeDoc.exists()) {
            throw new Error("Dispute not found!");
        }
        const poll = disputeDoc.data().poll as Poll;

        if (poll.voters?.includes(userId)) {
            // User has already voted, do nothing.
            return;
        }

        const optionIndex = poll.options.findIndex(opt => opt.text === optionText);
        if (optionIndex === -1) {
            throw new Error("Invalid poll option.");
        }
        
        const newOptions = poll.options.map((opt, index) => 
            index === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
        );
        
        transaction.update(disputeRef, {
            'poll.options': newOptions,
            'poll.voters': arrayUnion(userId)
        });
    });
  }

  export async function flagExistingPostAction(
    postId: string,
    postText: string,
    postAuthor: Post['author'],
    flaggingUserId: string
  ): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    const postRef = doc(db, 'posts', postId);
  
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data() as Post;
      if (postData.flaggedBy?.includes(flaggingUserId)) {
        throw new Error('You have already flagged this post.');
      }
    }
  
    const batch = writeBatch(db);
  
    const flaggedContentRef = doc(collection(db, 'flagged_content'));
    batch.set(flaggedContentRef, {
      postId,
      postText,
      author: postAuthor,
      reason: 'Manually flagged by user',
      flaggedAt: serverTimestamp(),
      flaggedByUserId,
    });
  
    batch.update(postRef, {
      flaggedBy: arrayUnion(flaggingUserId),
    });
  
    await batch.commit();
  }
  
  export async function trackSuggestionFollowAction(userId: string, followedUserId: string, suggestionSource: string) {
    if (!db) return;
    const suggestionFeedbackRef = doc(collection(db, `users/${userId}/suggestion_feedback`));
    await setDoc(suggestionFeedbackRef, {
      followedUserId,
      suggestionSource,
      action: 'follow',
      timestamp: serverTimestamp(),
    });
  }

  export async function dismissSuggestionAction(userId: string, dismissedUserId: string, suggestionSource: string) {
    if (!db) return;
    
    const batch = writeBatch(db);

    const suggestionFeedbackRef = doc(collection(db, `users/${userId}/suggestion_feedback`));
    batch.set(suggestionFeedbackRef, {
      dismissedUserId,
      suggestionSource,
      action: 'dismiss',
      timestamp: serverTimestamp(),
    });
    
    // Add to a list to prevent suggesting again for a while
    const dismissedRef = doc(db, `users/${userId}/dismissed_suggestions`, dismissedUserId);
    batch.set(dismissedRef, {
      dismissedAt: serverTimestamp(),
    });

    await batch.commit();
  }
