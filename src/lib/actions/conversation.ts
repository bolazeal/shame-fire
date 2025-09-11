
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
  // Firestore requires a composite index for this query: (participantIds, lastMessageTimestamp DESC)
  const q = query(
    conversationsRef,
    where('participantIds', '==', [currentUser.id, targetUser.id].sort())
  );

  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    // Conversation already exists
    return querySnapshot.docs[0].id;
  } else {
    // Create a new conversation
    const newConversation: Omit<Conversation, 'id'> & { createdAt: FieldValue } = {
      participantIds: [currentUser.id, targetUser.id].sort(),
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
