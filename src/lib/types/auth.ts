import type { User, UserCredential } from 'firebase/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (
    email: string,
    password,
    displayName: string
  ) => Promise<User | undefined>;
  login: (email, password) => Promise<User | undefined>;
  logout: () => Promise<void>;
}
