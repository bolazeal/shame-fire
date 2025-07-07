
'use server';

import {
  collection,
  doc,
  addDoc,
  serverTimestamp,
  updateDoc,
  writeBatch,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Notification } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// This is an internal function, not exported as a server action
// because it's only called by other server actions.
export const createNotification = async (
  data: Omit<Notification, 'id' | 'createdAt' | 'read'>
): Promise<void> => {
  if (!db) throw new Error('Firestore not initialized');
  // Prevent users from receiving notifications about their own actions
  if (data.sender.id === data.recipientId) {
    return;
  }
  const notificationRef = collection(
    db,
    `users/${data.recipientId}/notifications`
  );
  await addDoc(notificationRef, {
    ...data,
    sender: {
      id: data.sender.id,
      name: data.sender.name,
      username: data.sender.username,
      avatarUrl: data.sender.avatarUrl,
    },
    read: false,
    createdAt: serverTimestamp(),
  });
};

export async function markNotificationAsReadAction(
  userId: string,
  notificationId: string
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  const notificationRef = doc(db, `users/${userId}/notifications`, notificationId);
  await updateDoc(notificationRef, { read: true });
  revalidatePath('/notifications');
}

export async function markAllAsReadAction(userId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  const batch = writeBatch(db);
  const ref = collection(db, `users/${userId}/notifications`);
  const q = query(ref, where('read', '==', false));
  const snapshot = await getDocs(q);
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { read: true });
  });
  await batch.commit();
  revalidatePath('/notifications');
}
