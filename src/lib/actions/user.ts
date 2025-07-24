'use server';

import { auth, db } from '@/lib/firebase';
import {
  collection,
  doc,
  updateDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  collectionGroup,
} from 'firebase/firestore';
import type { User } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import type { User as FirebaseUser } from 'firebase/auth';
import type { FieldValue } from 'firebase/firestore';

export async function createUserProfileAction(
  firebaseUser: FirebaseUser,
  username: string
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');

  const userRef = doc(db, 'users', firebaseUser.uid);
  const usernameRef = doc(db, 'usernames', username.toLowerCase());

  try {
    await runTransaction(db, async (transaction) => {
      // Check for existing username inside the transaction
      const usernameDoc = await transaction.get(usernameRef);
      if (usernameDoc.exists()) {
        throw new Error('firestore/username-already-in-use');
      }

      // Check if this is the first user inside the transaction to prevent race conditions
      const usersQuery = query(collection(db, 'users'), limit(1));
      const usersSnapshot = await transaction.get(usersQuery);
      const isFirstUser = usersSnapshot.empty;

      const userProfile: Omit<User, 'id' | 'createdAt'> & {
        createdAt: FieldValue;
      } = {
        name: firebaseUser.displayName || 'Anonymous User',
        username: username,
        email: firebaseUser.email || '',
        avatarUrl: firebaseUser.photoURL || 'https://placehold.co/100x100.png',
        'data-ai-hint': 'person smiling',
        bannerUrl: 'https://placehold.co/1500x500.png',
        trustScore: 50,
        isVerified: false,
        isAdmin: isFirstUser, // Correctly determined inside the transaction
        bio: 'New user on Shame.',
        location: '',
        website: '',
        nominations: 0,
        moderatorNominationsCount: 0,
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
    if (error.message === 'firestore/username-already-in-use') {
      throw error;
    }
    console.error('Create user profile transaction failed: ', error);
    throw new Error('Failed to create user profile due to a server error.');
  }
}

export async function updateProfileAction(
  userId: string,
  data: Partial<Omit<User, 'id' | 'email'>>
) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('You must be logged in to update a profile.');
  }
  if (currentUser.uid !== userId) {
    throw new Error('You are not authorized to edit this profile.');
  }

  const allowedUpdates: Partial<User> = {
    name: data.name,
    bio: data.bio,
    location: data.location,
    website: data.website,
    avatarUrl: data.avatarUrl,
    bannerUrl: data.bannerUrl,
  };

  const updatesToPerform = Object.fromEntries(
    Object.entries(allowedUpdates).filter(([_, v]) => v !== undefined)
  );

  if (Object.keys(updatesToPerform).length === 0) {
    return;
  }

  if (!db) throw new Error('Firestore not initialized');
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, updatesToPerform);

  revalidatePath(`/profile/${userId}`);
}
