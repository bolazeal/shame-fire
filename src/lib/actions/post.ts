
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
  getUserByUsername,
} from '../firestore';
import { analyzeSentiment } from '@/ai/flows/analyze-sentiment';
import { detectHarmfulContent } from '@/ai/flows/detect-harmful-content';
import { generateEndorsementSummary } from '@/ai/flows/generate-endorsement-summary';
import { suggestTrustScore } from '@/ai/flows/suggest-trust-score';
import { identifyAdvocacyCause } from '@/ai/flows/identify-advocacy-cause';
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

function generateKeywords(text: string, category?: string): string[] {
    const fromText = text.toLowerCase().match(/\b(\w+)\b/g) || [];
    const keywords = new Set(fromText);

    if(category) {
        keywords.add(category.toLowerCase());
    }
    
    return Array.from(keywords);
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

  const newPost: Omit<Post, 'id' | 'createdAt'> & { createdAt: FieldValue, keywords: string[] } = {
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
    keywords: generateKeywords(postData.text, postData.category),
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

  // AI analysis for reports and endorsements
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

  // Advocacy cause identification for reports
  if (postData.type === 'report') {
    try {
      const advocacyResult = await identifyAdvocacyCause({
        postText: postData.text,
        postType: 'report',
      });
      if (advocacyResult.isAdvocacyCause) {
        newPost.advocacy = {
          isAdvocacyCause: true,
          title: advocacyResult.suggestedTitle || `Support for ${postData.entity}`,
          reasoning: advocacyResult.reasoning,
          goalAmount: advocacyResult.suggestedGoal || 5000,
          currentAmount: 0,
          contributorsCount: 0,
          contributors: [],
        };
      }
    } catch(e) {
      console.error('Failed to identify advocacy cause:', e);
    }
  }


  batch.set(postRef, newPost);

  await batch.commit();

  // Handle mentions after post is created
  const mentionRegex = /@(\w+)/g;
  const mentions = postData.text.match(mentionRegex);
  if (mentions) {
    // Use a Set to avoid duplicate notifications for the same user
    const mentionedUsernames = new Set(mentions.map(m => m.substring(1)));

    for (const username of mentionedUsernames) {
      const mentionedUser = await getUserByUsername(username);
      if (mentionedUser && mentionedUser.id !== author.id) {
        await createNotification({
          type: 'mention',
          recipientId: mentionedUser.id,
          sender: author,
          postId: postRef.id,
          postText: postData.text,
        });
      }
    }
  }


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
