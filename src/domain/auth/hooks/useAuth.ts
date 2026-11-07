import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '../services/authService';
import { LoginCredentials } from '../types/auth.types';
import { extractUserRole, ROLE_DEFAULT_ROUTES } from '@/config/roles';
import { toast } from '@/lib/alerts';

export const useAuth = () => {
  const router = useRouter();
  const { user, tokenSession, refreshToken, isAuthenticated, setAuth, logout } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials, customRedirectTo?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      setAuth(response.user, response.tokenSession, response.refreshToken);

      // Determinar la ruta por rol automáticamente
      const role = extractUserRole(response.user, response.tokenSession);
      const targetRoute = customRedirectTo || ROLE_DEFAULT_ROUTES[role] || '/licitaciones';

      await router.push(targetRoute);
      return response;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error inesperado al iniciar sesión';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      logout();
      toast.success('Sesión cerrada correctamente', {
        description: 'Has cerrado sesión en Limenka Licitaciones.',
      });
      router.push('/login');
    }
  };

  return {
    user,
    tokenSession,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: handleLogout,
  };
};
