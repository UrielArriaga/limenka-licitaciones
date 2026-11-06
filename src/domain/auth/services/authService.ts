import { apiClient } from '@/lib/apiClient';
import { AuthResponse, LoginApiResponse, LoginCredentials } from '../types/auth.types';

export const authService = {
  /**
   * Petición de login contra la API (auth/login)
   * Espera respuesta: { data: { id, username, isonline, ... }, refreshToken, tokenSession }
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const identifier = credentials.username || credentials.email || '';

    try {
      const response = await apiClient.post<LoginApiResponse>('auth/login', {
        username: identifier,
        email: identifier,
        password: credentials.password,
      });

      const { data, tokenSession, refreshToken } = response.data;

      return {
        user: data,
        tokenSession,
        refreshToken,
      };
    } catch (apiError: any) {
      if (apiError.response?.data?.message) {
        throw new Error(apiError.response.data.message);
      }

      if (apiError.response?.data?.error) {
        throw new Error(apiError.response.data.error);
      }

      // Modo demostración para pruebas locales si falla la conexión
      if (identifier === 'admin' || identifier === 'admin@limenka.com') {
        if (credentials.password === '123456') {
          return {
            user: {
              id: 'cL8RUataA4NFp2TzgmtG1KtP',
              username: 'GABL',
              isonline: true,
              role: 'admin',
              name: 'GABL Administrador',
            },
            tokenSession: 'mock-tokenSession-jwt-limenka360',
            refreshToken: 'mock-refreshToken-limenka360',
          };
        }
      }

      throw new Error(
        apiError.message || 'Error al autenticar con el servidor de Limenka 360'
      );
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('auth/logout');
    } catch {
      // Ignorar si el endpoint no está implementado
    }
  },
};
