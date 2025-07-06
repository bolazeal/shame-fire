
'use server';

import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

// Helper function to check if the current user is an admin
async function verifyAdmin(): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        throw new Error('You must be logged in to perform this action.');
    }
    const userProfileSnap = await getDoc(doc(db, 'users', currentUser.uid));
    if (!userProfileSnap.exists() || !userProfileSnap.data().isAdmin) {
        throw new Error('You are not authorized to perform this action.');
    }
}

export async function toggleAdminStatusAction(userId: string): Promise<void> {
    await verifyAdmin();

    const currentUser = auth.currentUser;
    if (currentUser?.uid === userId) {
        throw new Error('You cannot change your own admin status.');
    }

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        throw new Error('User not found.');
    }

    const currentIsAdmin = userSnap.data().isAdmin || false;
    await updateDoc(userRef, { isAdmin: !currentIsAdmin });

    revalidatePath('/admin');
}
