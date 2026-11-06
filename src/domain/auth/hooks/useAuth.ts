import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '../services/authService';
import { LoginCredentials } from '../types/auth.types';

export const useAuth = () => {
  const router = useRouter();
  const { user, tokenSession, refreshToken, isAuthenticated, setAuth, logout } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials, redirectTo = '/') => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      setAuth(response.user, response.tokenSession, response.refreshToken);
      await router.push(redirectTo);
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
    await authService.logout();
    logout();
    router.push('/login');
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
