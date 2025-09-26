'use server';

import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post, User, Dispute } from '@/lib/types';
import type { FieldValue } from 'firebase/firestore';
import { getUserProfile } from '../firestore';

export async function createDisputeAction(
  post: Post,
  disputingUser: User
): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  const batch = writeBatch(db);

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
    status: 'voting', // Start in voting phase
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

  const postRef = doc(db, 'posts', post.id);
  batch.update(postRef, { isEscalated: true });

  await batch.commit();
  return disputeRef.id;
}


export async function addVerdictToDisputeAction(
    disputeId: string,
    decision: string,
    reason: string,
    moderator: User
  ): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');
    const disputeRef = doc(db, 'disputes', disputeId);
  
    const verdict = {
      moderator: {
          id: moderator.id,
          name: moderator.name,
          username: moderator.username,
          avatarUrl: moderator.avatarUrl,
      },
      decision,
      reason,
    };
  
    await updateDoc(disputeRef, {
      verdict: verdict,
      status: 'closed',
    });
  };

    

    

    