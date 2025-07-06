'use server';
import type { User as AppUser } from '@/lib/types';
import type { User } from 'firebase/auth';

export interface AuthContextType {
  user: User | null;
  fullProfile: AppUser | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    displayName: string,
    username: string
  ) => Promise<User | undefined>;
  login: (email: string, password: string) => Promise<User | undefined>;
  loginWithGoogle: () => Promise<User | undefined>;
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}
