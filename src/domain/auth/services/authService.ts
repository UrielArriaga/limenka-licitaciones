import { apiClient } from '@/lib/apiClient';
import { AuthResponse, LoginApiResponse, LoginCredentials } from '../types/auth.types';
import { parseApiError } from '@/lib/alerts';
import Cookies from 'js-cookie';
import { ISPRODUCTION } from '@/config/constants';

export const authService = {
  /**
   * Petición de login contra apidev.limenka360.com/auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const rawEmail = credentials.email || credentials.username || '';
    const body = {
      email: rawEmail.trim(),
      password: credentials.password,
    };

    try {
      const response = await apiClient.post<LoginApiResponse>('auth/login', body);
      const { data, tokenSession, refreshToken } = response.data;

      // Guardar en Cookies seguras
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

      return {
        user: data,
        tokenSession,
        refreshToken,
      };
    } catch (apiError: any) {
      const internalCode = apiError?.response?.data?.internalCode;

      if (internalCode === '00001') {
        throw new Error('El correo o usuario no existe');
      }

      if (internalCode === '10002') {
        throw new Error('Correo o contraseña incorrecta');
      }

      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }

      const parsed = parseApiError(apiError);
      throw new Error(parsed.description || 'Error de conexión con el servidor');
    }
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      Cookies.remove('token', { path: '/' });
      Cookies.remove('refresh_token', { path: '/' });
      Cookies.remove('limenka-auth-session', { path: '/' });
      // Limpiar rastros de localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }

    try {
      await apiClient.post('auth/logout');
    } catch {
      // Ignorar si el endpoint en el backend responde 500 o no está implementado
    }
  },
};
