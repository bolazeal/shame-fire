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
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { AuthContextType } from '@/lib/types/auth';
import type { User as AppUser } from '@/lib/types';
import {
  createUserProfile,
  getUserProfile,
  fromFirestore,
} from '@/lib/firestore';
import { mockUsers } from '@/lib/mock-data';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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
} as unknown as User;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [fullProfile, setFullProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth as Auth, async (user) => {
        if (user) {
          const profile = await getUserProfile(user.uid);

          // ENFORCE ACCOUNT STATUS
          if (profile && profile.accountStatus !== 'active') {
            toast({
              title: 'Access Denied',
              description: `Your account has been ${profile.accountStatus}. Please contact support.`,
              variant: 'destructive',
            });
            await signOut(auth as Auth); // Sign them out immediately
            setUser(null);
            setFullProfile(null);
          } else {
            setUser(user);
            setFullProfile(profile);
          }
        } else {
          setUser(null);
          setFullProfile(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // In mock mode, check localStorage to persist a "logged in" state across reloads.
      console.warn('Firebase is not configured. Using mock authentication.');
      const mockSession = localStorage.getItem('mockUserSession');
      if (mockSession) {
        try {
            const parsedUser = JSON.parse(mockSession);
            setUser(parsedUser);
            const mockProfile = Object.values(mockUsers).find(u => u.id === parsedUser.uid);
            setFullProfile(mockProfile || null);
        } catch (e) {
            localStorage.removeItem('mockUserSession');
        }
      }
      setLoading(false);
    }
  }, [toast]);

  const signup = async (email: string, password: string, displayName: string, username: string) => {
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
      const userCredential = await createUserWithEmailAndPassword(auth as Auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await createUserProfile(userCredential.user, username);
      // onAuthStateChanged will set the user and fullProfile state
      return userCredential.user;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      console.warn("Mock Login: Simulating login with default user.");
      setLoading(true);
      localStorage.setItem('mockUserSession', JSON.stringify(mockAuthUser));
      setUser(mockAuthUser);
      setFullProfile(mockUsers.user1);
      setLoading(false);
      return mockAuthUser;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth as Auth, email, password);
      const profile = await getUserProfile(userCredential.user.uid);
      
      if (profile && profile.accountStatus !== 'active') {
        toast({
          title: 'Login Failed',
          description: `Your account has been ${profile.accountStatus}. Please contact support.`,
          variant: 'destructive',
        });
        await signOut(auth as Auth);
        return undefined; 
      }
      return userCredential.user;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
        console.warn("Mock Google Login: Simulating login.");
        setLoading(true);
        const googleMockUserAuth = { ...mockAuthUser, uid: 'user2', email: 'jane@example.com', displayName: 'Jane Smith' };
        localStorage.setItem('mockUserSession', JSON.stringify(googleMockUserAuth));
        setUser(googleMockUserAuth);
        setFullProfile(mockUsers.user2);
        setLoading(false);
        return googleMockUserAuth;
    }

    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth as Auth, provider);
        const user = result.user;

        const userRef = doc(db as Firestore, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            const username = user.email ? user.email.split('@')[0] : `user${Date.now()}`;
            await createUserProfile(user, username);
        } else {
            const profile = fromFirestore<AppUser>(docSnap);
            if (profile.accountStatus !== 'active') {
                toast({
                    title: 'Login Failed',
                    description: `Your account has been ${profile.accountStatus}. Please contact support.`,
                    variant: 'destructive',
                });
                await signOut(auth as Auth);
                return undefined;
            }
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
      setFullProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await signOut(auth as Auth);
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetEmailFunc = async (email: string) => {
    if (!isFirebaseConfigured) {
      console.warn('Mock Password Reset: Simulating email sent.');
      toast({
        title: 'Password Reset Email Sent',
        description:
          'If an account exists for this email, a reset link has been sent (simulated).',
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth as Auth, email);
      toast({
        title: 'Password Reset Email Sent',
        description:
          'If an account exists with that email, a password reset link has been sent to it.',
      });
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: 'Password Reset Email Sent',
        description:
          'If an account exists with that email, a password reset link has been sent to it.',
      });
    }
  };

  const value = { user, fullProfile, loading, signup, login, loginWithGoogle, logout, sendPasswordResetEmail: sendPasswordResetEmailFunc };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
