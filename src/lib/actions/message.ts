'use server';

import {
  collection,
  doc,
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

  // Create a new document reference in the messages subcollection
  const newMessageRef = doc(messagesRef);

  const messagePayload: {
    senderId: string;
    text: string;
    createdAt: any;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
  } = {
    senderId,
    text,
    createdAt: serverTimestamp(),
  };

  if (mediaUrl && mediaType) {
    messagePayload.mediaUrl = mediaUrl;
    messagePayload.mediaType = mediaType;
  }

  batch.set(newMessageRef, messagePayload);

  // Update the parent conversation document
  let lastMessageText = text;
  if (!lastMessageText && mediaType) {
    lastMessageText = mediaType === 'image' ? 'Sent an image' : 'Sent a video';
  }

  batch.update(conversationRef, {
    lastMessageText: lastMessageText,
    lastMessageTimestamp: serverTimestamp(),
    lastMessageSenderId: senderId,
  });

  await batch.commit();
}
