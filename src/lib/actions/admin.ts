
'use server';

import { auth, db } from '@/lib/firebase';
import { collection, doc, getDoc, updateDoc, deleteDoc, writeBatch, getDocs, query, where } from 'firebase/firestore';
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

export async function updateUserAccountStatusAction(
    userId: string,
    status: 'active' | 'suspended' | 'banned'
): Promise<void> {
    await verifyAdmin();
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { accountStatus: status });
}

export async function resetUserTrustScoreAction(userId: string): Promise<void> {
    await verifyAdmin();
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { trustScore: 50 });
}

export async function removeFlaggedItemAction(flaggedItemId: string): Promise<void> {
    await verifyAdmin();
    const flagRef = doc(db, 'flagged_content', flaggedItemId);
    await deleteDoc(flagRef);
}

export async function deletePostAndFlagsAction(postId: string): Promise<void> {
    await verifyAdmin();
    const batch = writeBatch(db);

    // Delete the post
    const postRef = doc(db, 'posts', postId);
    batch.delete(postRef);

    // Find and delete all flags associated with the post
    const flagsRef = collection(db, 'flagged_content');
    const q = query(flagsRef, where('postId', '==', postId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
}
