import { NextResponse } from 'next/server';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { app } from '@/lib/firebase'; // Assuming firebase is initialized in src/lib/firebase.ts
import { getFirestore } from 'firebase/firestore';

const db = getFirestore(app);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;

    // Fetch the post document
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return new NextResponse('Post not found', { status: 404 });
    }

    const postData = postSnap.data();

    // Fetch comments subcollection
    const commentsRef = collection(postRef, 'comments');
    const commentsQuery = query(commentsRef, orderBy('createdAt', 'asc')); // Assuming a 'createdAt' field for sorting comments
    const commentsSnap = await getDocs(commentsQuery);

    const commentsData = commentsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Combine post and comments data
    const responseData = {
      id: postSnap.id,
      ...postData,
      comments: commentsData,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error fetching post and comments:', error);
    return new NextResponse(`Error fetching data: ${error.message}`, { status: 500 });
  }
}