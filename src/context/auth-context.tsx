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

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const mockUserTemplate = {
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: 'password',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => '',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase is configured, use it.
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    }

    // Otherwise, run in mock mode for a better demo experience.
    // Start with a default logged-in user.
    setUser({
      uid: 'user1',
      email: 'alexdoe@example.com',
      displayName: 'Alex Doe',
      photoURL: 'https://placehold.co/100x100.png',
      ...mockUserTemplate,
    } as User);
    setLoading(false);
  }, []);

  const signup = async (email: string, password, displayName: string) => {
    setLoading(true);
    // Handle mock signup if Firebase isn't configured.
    if (!auth) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newUser = {
        uid: `mock-user-${Date.now()}`,
        email,
        displayName,
        photoURL: `https://placehold.co/100x100.png`,
        ...mockUserTemplate,
      } as User;
      setUser(newUser);
      setLoading(false);
      return newUser;
    }

    // Handle real signup.
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName });
      // The onAuthStateChanged listener will set the user.
      return userCredential.user;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    // Handle mock login if Firebase isn't configured.
    if (!auth) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockUser = {
        uid: 'user1',
        email,
        displayName: 'Alex Doe',
        photoURL: 'https://placehold.co/100x100.png',
        ...mockUserTemplate,
      } as User;
      setUser(mockUser);
      setLoading(false);
      return mockUser;
    }

    // Handle real login.
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // The onAuthStateChanged listener will set the user.
      return userCredential.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    // Handle mock logout if Firebase isn't configured.
    if (!auth) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUser(null);
      setLoading(false);
      return;
    }

    // Handle real logout.
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
