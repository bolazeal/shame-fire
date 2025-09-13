
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
  text: string,
  mediaUrl?: string,
  mediaType?: 'image' | 'video'
): Promise<void> {
  if (!db) throw new Error('Firestore not initialized');
  if (!text.trim() && !mediaUrl) {
    // Do not send empty messages
    return;
  }

  const batch = writeBatch(db);

  const messagesRef = collection(db, `conversations/${conversationId}/messages`);
  const conversationRef = doc(db, 'conversations', conversationId);
  
  const newMessageRef = doc(messagesRef);

  const messagePayload: any = {
    senderId,
    text,
    createdAt: serverTimestamp(),
  };

  if (mediaUrl && mediaType) {
    messagePayload.mediaUrl = mediaUrl;
    messagePayload.mediaType = mediaType;
  }

  batch.set(newMessageRef, messagePayload);
  
  let lastMessageText = text;
  if (!text && mediaType) {
    lastMessageText = `Sent an ${mediaType}`;
  }

  batch.update(conversationRef, {
      lastMessageText: lastMessageText,
      lastMessageTimestamp: serverTimestamp(),
      lastMessageSenderId: senderId,
  });

  await batch.commit();
}
