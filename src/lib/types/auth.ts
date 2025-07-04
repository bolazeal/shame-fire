'use server';
import type { User as AppUser } from '@/lib/types';
import type { User, UserCredential } from 'firebase/auth';

export interface AuthContextType {
  user: User | null;
  fullProfile: AppUser | null;
  loading: boolean;
  signup: (
    email: string,
    password,
    displayName: string
  ) => Promise<User | undefined>;
  login: (email, password) => Promise<User | undefined>;
  loginWithGoogle: () => Promise<User | undefined>;
  logout: () => Promise<void>;
}
