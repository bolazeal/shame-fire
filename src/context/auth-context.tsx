'use client';

import { createContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { AuthContextType } from '@/lib/types/auth';
import { createUserProfile } from '@/lib/firestore';

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.warn('Firebase Auth is not configured. App is in read-only mode.');
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password, displayName: string) => {
    if (!auth) throw new Error('Auth is not initialized.');
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName });

      // Create a corresponding user profile in Firestore
      await createUserProfile(userCredential.user);

      // The onAuthStateChanged listener will update the user state.
      return userCredential.user;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    if (!auth) throw new Error('Auth is not initialized.');

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // The onAuthStateChanged listener will update the user state.
      return userCredential.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) throw new Error('Auth is not initialized.');

    setLoading(true);
    try {
      await signOut(auth);
      // The onAuthStateChanged listener will set the user to null.
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
