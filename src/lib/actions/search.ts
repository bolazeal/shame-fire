'use server';

import { searchPosts, searchUsers } from '../firestore';
import type { Post, User } from '../types';

export async function searchAction(query: string): Promise<{ users: User[], posts: Post[] }> {
    if (!query || query.trim().length < 2) {
        return { users: [], posts: [] };
    }

    try {
        const [users, posts] = await Promise.all([
            searchUsers(query),
            searchPosts(query)
        ]);

        return { users, posts };
    } catch (error) {
        console.error("Search action failed:", error);
        // In a real app, you might want to log this error to a monitoring service
        return { users: [], posts: [] };
    }
}
