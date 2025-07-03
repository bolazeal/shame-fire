'use client';

import { createContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import type { AuthContextType } from '@/lib/types/auth';
import { createUserProfile } from '@/lib/firestore';
import { mockUsers } from '@/lib/mock-data';
import { doc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// This is a mock user object that can be used for development when Firebase isn't configured.
// It's designed to satisfy the `User` type from `firebase/auth`.
const mockAuthUser = {
  uid: mockUsers.user1.id,
  email: mockUsers.user1.email,
  displayName: mockUsers.user1.name,
  photoURL: mockUsers.user1.avatarUrl,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: 'password',
  tenantId: null,
  refreshToken: 'mock-refresh-token',
  delete: async () => console.warn('Mock user delete called.'),
  getIdToken: async () => 'mock-id-token',
  getIdTokenResult: async () => ({
    token: 'mock-id-token',
    claims: {},
    authTime: new Date().toISOString(),
    issuedAtTime: new Date().toISOString(),
    signInProvider: 'password',
    signInSecondFactor: null,
    expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
  }),
  reload: async () => console.warn('Mock user reload called.'),
  toJSON: () => ({
      uid: mockUsers.user1.id,
      email: mockUsers.user1.email,
      displayName: mockUsers.user1.name,
  }),
} as User;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isFirebaseConfigured = !!auth && !!db;

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // In mock mode, check localStorage to persist a "logged in" state across reloads.
      console.warn('Firebase is not configured. Using mock authentication.');
      const mockSession = localStorage.getItem('mockUserSession');
      if (mockSession) {
        try {
            setUser(JSON.parse(mockSession));
        } catch (e) {
            localStorage.removeItem('mockUserSession');
        }
      }
      setLoading(false);
    }
  }, [isFirebaseConfigured]);

  const signup = async (email: string, password, displayName: string) => {
    if (!isFirebaseConfigured) {
      console.warn("Mock Signup: Simulating user creation.");
      setLoading(true);
      const newUser = { ...mockAuthUser, uid: `mock_${Date.now()}`, email, displayName };
      localStorage.setItem('mockUserSession', JSON.stringify(newUser));
      setUser(newUser);
      setLoading(false);
      return newUser;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await createUserProfile(userCredential.user);
      // onAuthStateChanged will set the user state
      return userCredential.user;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    if (!isFirebaseConfigured) {
      console.warn("Mock Login: Simulating login with default user.");
      setLoading(true);
      localStorage.setItem('mockUserSession', JSON.stringify(mockAuthUser));
      setUser(mockAuthUser);
      setLoading(false);
      return mockAuthUser;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !db) {
        console.warn("Mock Google Login: Simulating login.");
        setLoading(true);
        // Using a different mock user to show a difference from email login
        const googleMockUser = { ...mockAuthUser, uid: 'user2', email: 'jane@example.com', displayName: 'Jane Smith' };
        localStorage.setItem('mockUserSession', JSON.stringify(googleMockUser));
        setUser(googleMockUser);
        setLoading(false);
        return googleMockUser;
    }

    setLoading(true);
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            // New user via Google, create their profile in Firestore
            await createUserProfile(user);
        }

        return user;
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured) {
      console.warn("Mock Logout: Clearing simulated user session.");
      setLoading(true);
      localStorage.removeItem('mockUserSession');
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };

  const value = { user, loading, signup, login, loginWithGoogle, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
