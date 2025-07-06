'use server';

import { doc, writeBatch, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { hasUserNominated, hasUserNominatedForModerator, getUserByEntityName } from '../firestore';

export async function nominateUserForMedalAction(
  nominatedUserId: string,
  nominatorId: string
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  if (await hasUserNominated(nominatorId, nominatedUserId)) {
    throw new Error('You have already nominated this user.');
  }

  const batch = writeBatch(db);
  const nominationRef = doc(db, `users/${nominatedUserId}/nominators`, nominatorId);
  batch.set(nominationRef, { timestamp: serverTimestamp() });

  const userRef = doc(db, 'users', nominatedUserId);
  batch.update(userRef, { nominations: increment(1) });

  await batch.commit();
}

export async function nominateUserForModeratorAction(
  nominatedUserId: string,
  nominatorId: string
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  if (await hasUserNominatedForModerator(nominatorId, nominatedUserId)) {
    throw new Error('You have already nominated this user to be a moderator.');
  }

  const batch = writeBatch(db);
  const nominationRef = doc(db, `users/${nominatedUserId}/moderatorNominators`, nominatorId);
  batch.set(nominationRef, { timestamp: serverTimestamp() });

  const userRef = doc(db, 'users', nominatedUserId);
  batch.update(userRef, { moderatorNominationsCount: increment(1) });

  await batch.commit();
}


export async function nominateUserForMedalFromPostAction(entityName: string, nominatorId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    const targetUser = await getUserByEntityName(entityName);
    if (!targetUser) {
        throw new Error(`User "${entityName}" not found.`);
    }

    if (await hasUserNominated(nominatorId, targetUser.id)) {
        throw new Error('You have already nominated this user.');
    }

    const batch = writeBatch(db);
    const nominationRef = doc(db, `users/${targetUser.id}/nominators`, nominatorId);
    batch.set(nominationRef, { timestamp: serverTimestamp() });

    const userRef = doc(db, 'users', targetUser.id);
    batch.update(userRef, { nominations: increment(1) });

    await batch.commit();
}
