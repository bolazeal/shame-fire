'use server';

import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function updateProfileAction(
  userId: string,
  data: Partial<Omit<User, 'id' | 'email'>>
) {
  // 1. Get current authenticated user from the server session
  const currentUser = auth.currentUser;

  // 2. Authorization Check
  if (!currentUser) {
    throw new Error('You must be logged in to update a profile.');
  }
  if (currentUser.uid !== userId) {
    throw new Error('You are not authorized to edit this profile.');
  }

  // 3. Sanitize input: Prevent users from updating protected fields
  const allowedUpdates: Partial<User> = {
    name: data.name,
    bio: data.bio,
    location: data.location,
    website: data.website,
    avatarUrl: data.avatarUrl,
    bannerUrl: data.bannerUrl,
  };

  // Filter out any undefined fields so we don't overwrite with empty values
  const updatesToPerform = Object.fromEntries(
    Object.entries(allowedUpdates).filter(([_, v]) => v !== undefined)
  );

  if (Object.keys(updatesToPerform).length === 0) {
    return; // Nothing to update
  }

  // 4. Perform the database update
  if (!db) throw new Error('Firestore not initialized');
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, updatesToPerform);

  // 5. Revalidate path to show updated data
  revalidatePath(`/profile/${userId}`);
}
