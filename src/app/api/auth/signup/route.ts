import { NextResponse } from 'next/server';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { auth, app } from '@/lib/firebase';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (!auth || !app) {
      return NextResponse.json({ error: 'Firebase is not initialized' }, { status: 500 });
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    const db = getFirestore(app);
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      trustScore: 0, // Initial trust score
      isVerified: false, // Initial verification status
      // Add other initial user data here
    });

    return NextResponse.json({ uid: user.uid, email: user.email }, { status: 201 });
  } catch (error: any) {
    console.error('Signup failed:', error);
    let errorMessage = 'An error occurred during signup.';
    if (error.code) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}