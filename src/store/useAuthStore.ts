import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserData } from '@/domain/auth/types/auth.types';
import { cookieStorage } from '@/lib/cookieStorage';
import Cookies from 'js-cookie';
import { ISPRODUCTION } from '@/config/constants';

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
      setAuth: (user, tokenSession, refreshToken) => {
        // Almacenar token individual en Cookie con directivas seguras
        if (typeof window !== 'undefined') {
          Cookies.set('token', tokenSession, {
            expires: 7,
            secure: ISPRODUCTION === 'true',
            sameSite: 'lax',
            path: '/',
          });
          Cookies.set('refresh_token', refreshToken, {
            expires: 7,
            secure: ISPRODUCTION === 'true',
            sameSite: 'lax',
            path: '/',
          });
        }

        set({
          user,
          tokenSession,
          refreshToken,
          isAuthenticated: true,
        });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          Cookies.remove('token', { path: '/' });
          Cookies.remove('refresh_token', { path: '/' });
          Cookies.remove('limenka-auth-session', { path: '/' });
          // Limpiar también cualquier rastro de localStorage anterior
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }

        set({
          user: null,
          tokenSession: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'limenka-auth-session', // Nombre de la cookie de estado
      storage: createJSONStorage(() => cookieStorage),
    }
  )
);
