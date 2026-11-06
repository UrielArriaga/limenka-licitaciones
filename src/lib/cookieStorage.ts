import Cookies from 'js-cookie';
import { ISPRODUCTION } from '@/config/constants';
import { StateStorage } from 'zustand/middleware';

/**
 * Adaptador de almacenamiento en Cookies para Zustand con directivas seguras
 */
export const cookieStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    return Cookies.get(name) ?? null;
  },

  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    Cookies.set(name, value, {
      expires: 7, // Sesión válida por 7 días
      secure: ISPRODUCTION === 'true', // Requiere HTTPS en producción
      sameSite: 'lax', // Protección contra ataques CSRF
      path: '/',
    });
  },

  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    Cookies.remove(name, { path: '/' });
  },
};

