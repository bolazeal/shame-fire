'use server';

import {
  collection,
  doc,
  addDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function sendMessageAction(
  conversationId: string,
  senderId: string,
  text: string
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  if (!text.trim()) {
    // Do not send empty messages
    return;
  }

  const batch = writeBatch(db);

  const messagesRef = collection(db, `conversations/${conversationId}/messages`);
  const conversationRef = doc(db, 'conversations', conversationId);
  
  // Create a new document reference in the messages subcollection
  const newMessageRef = doc(messagesRef);

  batch.set(newMessageRef, {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });
  
  // Update the parent conversation document
  batch.update(conversationRef, {
      lastMessageText: text,
      lastMessageTimestamp: serverTimestamp(),
      lastMessageSenderId: senderId,
  });

  await batch.commit();
}
