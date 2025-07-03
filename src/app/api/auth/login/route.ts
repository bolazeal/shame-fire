import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    return NextResponse.json({ uid: user.uid }, { status: 200 });
  } catch (error: any) {
    console.error('Login failed:', error);
    return NextResponse.json(
      { message: 'Login failed.', error: error.message },
      { status: 500 }
    );
  }
}