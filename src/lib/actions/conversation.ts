
'use server';

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, Conversation } from '@/lib/types';
import type { FieldValue } from 'firebase/firestore';

export async function findOrCreateConversationAction(
  currentUser: User,
  targetUser: User
): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');
  
  if (currentUser.id === targetUser.id) {
    throw new Error('Cannot start a conversation with yourself.');
  }

  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participantIds', 'array-contains', currentUser.id),
    limit(100) // Adjust limit as needed, Firestore requires array-contains with another clause
  );

  const querySnapshot = await getDocs(q);
  const existingConversation = querySnapshot.docs.find(doc =>
    doc.data().participantIds.includes(targetUser.id)
  );

  if (existingConversation) {
    return existingConversation.id;
  } else {
    // Create a new conversation
    const newConversation: Omit<Conversation, 'id'> & { createdAt: FieldValue } = {
      participantIds: [currentUser.id, targetUser.id],
      participants: [
        {
          id: currentUser.id,
          name: currentUser.name,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
        },
        {
          id: targetUser.id,
          name: targetUser.name,
          username: targetUser.username,
          avatarUrl: targetUser.avatarUrl,
        },
      ],
      createdAt: serverTimestamp(),
      lastMessageTimestamp: serverTimestamp(),
    };

    const docRef = await addDoc(conversationsRef, newConversation);
    return docRef.id;
  }
}

    