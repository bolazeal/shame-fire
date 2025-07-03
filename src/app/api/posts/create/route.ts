import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase'; // Assuming you have db initialized in firebase.ts
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export async function POST(req: Request) {
  try {
    // Ensure the user is authenticated
    const user = await new Promise<any | null>((resolve) => {
      onAuthStateChanged(auth, (user) => {
        resolve(user);
      });
    });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, category, mediaUrls } = await req.json();

    // Validate incoming data
    if (!content || !category) {
      return NextResponse.json({ error: 'Content and category are required' }, { status: 400 });
    }

    const postsCollectionRef = collection(db, 'posts');

    const newPost = {
      authorId: user.uid,
      content,
      category,
      mediaUrls: mediaUrls || [],
      createdAt: Timestamp.now(),
      // Add other relevant fields here (e.g., initial trust score, flags, etc.)
    };

    const docRef = await addDoc(postsCollectionRef, newPost);

    return NextResponse.json({ postId: docRef.id, success: true }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: error.message || 'An error occurred while creating the post.' }, { status: 500 });
  }
}