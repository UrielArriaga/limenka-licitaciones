import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserData } from '@/domain/auth/types/auth.types';
import { cookieStorage } from '@/lib/cookieStorage';

interface AuthState {
  user: UserData | null;
  tokenSession: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserData, tokenSession: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokenSession: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, tokenSession, refreshToken) =>
        set({
          user,
          tokenSession,
          refreshToken,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          tokenSession: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'limenka-session',
      storage: createJSONStorage(() => cookieStorage),
    }
  )
);
