
'use server';

import { doc, writeBatch, serverTimestamp, increment, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { hasUserNominated, getUserByEntityName } from '../firestore';
import type { MedalNomination } from '../types';

export async function nominateUserForMedalAction(
  nominatedUserId: string,
  nominatorId: string,
  medalTitle: string
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  if (await hasUserNominated(nominatorId, nominatedUserId, medalTitle)) {
    throw new Error(`You have already nominated this user for the "${medalTitle}" medal.`);
  }

  const batch = writeBatch(db);
  const nominationRef = doc(db, `users/${nominatedUserId}/medalNominations`, `${nominatorId}_${medalTitle.replace(/\s+/g, '_')}`);
  
  const nominationData: MedalNomination = {
    nominatorId,
    medalTitle,
    nominatedAt: serverTimestamp(),
  };

  batch.set(nominationRef, nominationData);

  const userRef = doc(db, 'users', nominatedUserId);
  batch.update(userRef, { nominations: increment(1) });

  await batch.commit();
}

export async function nominateUserForModeratorAction(
  nominatedUserId: string,
  nominatorId: string
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  const moderatorNominationRef = doc(db, `users/${nominatedUserId}/moderatorNominators`, nominatorId);
  const docSnap = await getDoc(moderatorNominationRef);

  if (docSnap.exists()) {
    throw new Error('You have already nominated this user to be a moderator.');
  }
  
  const batch = writeBatch(db);
  batch.set(moderatorNominationRef, { timestamp: serverTimestamp() });

  const userRef = doc(db, 'users', nominatedUserId);
  batch.update(userRef, { moderatorNominationsCount: increment(1) });

  await batch.commit();
}


export async function nominateUserForMedalFromPostAction(entityName: string, nominatorId: string, medalTitle: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const targetUser = await getUserByEntityName(entityName);
    if (!targetUser) {
        throw new Error(`User "${entityName}" not found.`);
    }

    await nominateUserForMedalAction(targetUser.id, nominatorId, medalTitle);
}

