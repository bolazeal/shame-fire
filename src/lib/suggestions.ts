'use server';

import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    onSnapshot,
    type WhereFilterOp,
    DocumentSnapshot,
  } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { getFollowing, getUserActivity, fromFirestore } from './firestore';
import type { User, Post } from './types';


// Algorithm 1: Mutual Connections
async function getMutualConnectionSuggestions(userId: string, followingIds: Set<string>, count: number): Promise<User[]> {
    if (followingIds.size === 0) return [];
    
    const friendsOfFriends = new Map<string, number>();

    // Limit the number of friends to check to avoid excessive reads
    const friendsToCheck = Array.from(followingIds).slice(0, 20);

    for (const friendId of friendsToCheck) {
        const theirFollowing = await getFollowing(friendId);
        for (const fof of theirFollowing) {
            if (fof.id !== userId && !followingIds.has(fof.id)) {
                friendsOfFriends.set(fof.id, (friendsOfFriends.get(fof.id) || 0) + 1);
            }
        }
    }
    
    const sortedSuggestions = Array.from(friendsOfFriends.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id)
        .slice(0, count);

    if (sortedSuggestions.length === 0) return [];

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('id', 'in', sortedSuggestions));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({ ...fromFirestore<User>(doc), suggestionSource: 'mutuals' }));
}

// Algorithm 2: Interest-Based Matching from User Activity
async function getInterestBasedSuggestions(userId: string, followingIds: Set<string>, count: number): Promise<User[]> {
    const recentActivity = await getUserActivity(userId, 'upvotedBy', 25);
    if (recentActivity.length === 0) return [];

    const categoryCounts = new Map<string, number>();
    recentActivity.forEach(post => {
        if (post.category) {
            categoryCounts.set(post.category, (categoryCounts.get(post.category) || 0) + 1);
        }
    });

    const topCategories = Array.from(categoryCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category]) => category);

    if (topCategories.length === 0) return [];

    const postsRef = collection(db, 'posts');
    const q = query(
        postsRef,
        where('category', 'in', topCategories),
        orderBy('createdAt', 'desc'),
        limit(50)
    );

    const snapshot = await getDocs(q);
    const authorIds = new Set<string>();
    snapshot.docs.forEach(doc => {
        const post = fromFirestore<Post>(doc);
        if (post.authorId !== userId && !followingIds.has(post.authorId)) {
            authorIds.add(post.authorId);
        }
    });

    const suggestedUserIds = Array.from(authorIds).slice(0, count);
    if (suggestedUserIds.length === 0) return [];

    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, where('id', 'in', suggestedUserIds));
    const usersSnapshot = await getDocs(usersQuery);

    return usersSnapshot.docs.map(doc => ({ ...fromFirestore<User>(doc), suggestionSource: 'interest' }));
}


export async function getUserSuggestions(userId: string, totalCount: number): Promise<User[]> {
    if (!isFirebaseConfigured) return [];

    const following = await getFollowing(userId);
    const followingIds = new Set(following.map(u => u.id));
    
    // Get dismissed suggestions (simplified)
    const dismissedRef = collection(db, `users/${userId}/dismissed_suggestions`);
    const dismissedSnap = await getDocs(dismissedRef);
    const dismissedIds = new Set(dismissedSnap.docs.map(doc => doc.id));

    // Combine all users user already follows or has dismissed
    const exclusionIds = new Set([...followingIds, ...dismissedIds]);


    const mutualsPromise = getMutualConnectionSuggestions(userId, followingIds, totalCount);
    const interestsPromise = getInterestBasedSuggestions(userId, followingIds, totalCount);

    const [mutualSuggestions, interestSuggestions] = await Promise.all([mutualsPromise, interestsPromise]);

    const combined = new Map<string, User>();
    
    const addSuggestions = (suggestions: User[]) => {
        for (const user of suggestions) {
            if (!exclusionIds.has(user.id) && !combined.has(user.id)) {
                combined.set(user.id, user);
            }
        }
    };
    
    addSuggestions(mutualSuggestions);
    addSuggestions(interestSuggestions);

    // TODO: Add more algorithms and a weighting system
    
    return Array.from(combined.values()).slice(0, totalCount);
}