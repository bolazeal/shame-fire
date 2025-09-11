
'use server';

import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  writeBatch,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  getUserByEntityName,
  getUserProfile,
} from '../firestore';
import { analyzeSentiment } from '@/ai/flows/analyze-sentiment';
import { detectHarmfulContent } from '@/ai/flows/detect-harmful-content';
import { generateEndorsementSummary } from '@/ai/flows/generate-endorsement-summary';
import { suggestTrustScore } from '@/ai/flows/suggest-trust-score';
import type {
  Post,
  PostCreationData,
  User,
  FlaggedContent,
} from '@/lib/types';
import type { FieldValue } from 'firebase/firestore';
import { createNotification } from './notification';

// Internal function to add a post to the moderation queue. Not exported.
async function addFlaggedItemToQueue(
    item: Omit<FlaggedContent, 'id' | 'flaggedAt'> & { flaggedAt?: FieldValue }
  ): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    const flaggedContentRef = collection(db, 'flagged_content');
    await addDoc(flaggedContentRef, {
      ...item,
      flaggedAt: serverTimestamp(),
    });
}


// Internal function that contains the core logic for creating a post.
// Not exported, only used by the server actions in this file.
async function _createPostInternal(
  postData: PostCreationData,
  author: User
): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');

  const batch = writeBatch(db);
  const postRef = doc(collection(db, 'posts'));

  const newPost: Omit<Post, 'id' | 'createdAt'> & { createdAt: FieldValue } = {
    type: postData.type,
    author: {
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
    flaggedBy: [],
    isEscalated: false,
  };

  const entityContact: Post['entityContact'] = {};
  if (postData.entityContactEmail)
    entityContact.email = postData.entityContactEmail;
  if (postData.entityContactPhone)
    entityContact.phone = postData.entityContactPhone;
  if (postData.entityContactSocialMedia)
    entityContact.socialMedia = postData.entityContactSocialMedia;

  if (Object.keys(entityContact).length > 0) {
    newPost.entityContact = entityContact;
  }

  if (postData.type !== 'post') {
    const [sentimentResult, summaryResult] = await Promise.all([
      analyzeSentiment({ text: postData.text }),
      generateEndorsementSummary({ endorsementText: postData.text }),
    ]);
    newPost.sentiment = sentimentResult;
    newPost.summary = summaryResult.summary;

    if (postData.entity) {
      const targetUser = await getUserByEntityName(postData.entity);
      if (targetUser && targetUser.id !== author.id) {
        try {
          const scoreResult = await suggestTrustScore({
            currentTrustScore: targetUser.trustScore,
            postType: postData.type as 'report' | 'endorsement',
            postSentimentScore: sentimentResult.sentimentScore,
          });

          if (scoreResult.newTrustScore !== targetUser.trustScore) {
            const targetUserRef = doc(db, 'users', targetUser.id);
            batch.update(targetUserRef, {
              trustScore: scoreResult.newTrustScore,
            });
          }
        } catch (e) {
          console.error('Failed to suggest or update trust score:', e);
        }
      }
    }
  }

  batch.set(postRef, newPost);

  // Handle Mentions
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  let match;
  const mentionedUsernames = new Set<string>();
  while ((match = mentionRegex.exec(postData.text)) !== null) {
    mentionedUsernames.add(match[1]);
  }

  if (mentionedUsernames.size > 0) {
    for (const username of mentionedUsernames) {
      try {
        const usernameRef = doc(db, 'usernames', username.toLowerCase());
        const usernameSnap = await getDoc(usernameRef);

        if (usernameSnap.exists()) {
          const recipientId = usernameSnap.data().userId;
          // Ensure not to notify the author of their own mention
          if (recipientId && recipientId !== author.id) {
            await createNotification({
              type: 'mention',
              recipientId: recipientId,
              sender: author,
              postId: postRef.id,
              postText: postData.text,
            });
          }
        }
      } catch (error) {
        console.error(`Failed to process mention for @${username}:`, error);
      }
    }
  }

  await batch.commit();

  return postRef.id;
}

/**
 * Server action for users to create a new post. Includes a content moderation check.
 */
export async function createPostAction(
  postData: PostCreationData,
  author: User
): Promise<string> {
  const moderationResult = await detectHarmfulContent({ text: postData.text });
  if (moderationResult.isHarmful) {
    await addFlaggedItemToQueue({
      postData,
      author,
      reason: moderationResult.reason,
    });
    throw new Error(`MODERATION_FLAG:${moderationResult.reason}`);
  }

  return _createPostInternal(postData, author);
}

/**
 * Server action for admins to approve a post from the moderation queue.
 * This skips the initial moderation check.
 */
export async function approvePostAction(item: FlaggedContent): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  if (!item.postData) {
    throw new Error(
      'This item cannot be approved, it was a flag on an existing post.'
    );
  }

  const authorProfile = await getUserProfile(item.author.id as string);
  if (!authorProfile) throw new Error('Could not find author profile.');

  // Create the post, skipping the moderation check that already failed.
  await _createPostInternal(item.postData, authorProfile);

  // Remove the item from the flagged queue.
  const { removeFlaggedItemAction } = await import('./admin');
  await removeFlaggedItemAction(item.id);
}
