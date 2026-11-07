import axios, { AxiosRequestConfig } from 'axios';
import { URL } from '@/config/constants';
import { useAuthStore } from '@/store/useAuthStore';
import { notifyApiError } from './alerts';
import Cookies from 'js-cookie';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipGlobalErrorAlert?: boolean;
  }
}

export const apiClient = axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: false, // Incompatible con Access-Control-Allow-Origin: * del backend
});

// Interceptor de Solicitud: Inyecta el tokenSession desde Cookies / Zustand
apiClient.interceptors.request.use(
  (config) => {
    let token = useAuthStore.getState().tokenSession;

    // Si no está en memoria, leer directamente de la cookie segura
    if (!token && typeof window !== 'undefined') {
      token = Cookies.get('token') || null;
    }

    if (token) {
      config.headers.Authorization = token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuesta: Control de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      error.config?.url?.includes('auth/login') ||
      error.config?.url?.includes('auth/logout');

    const skipAlert = error.config?.skipGlobalErrorAlert || isAuthRoute;

    if (!skipAlert) {
      notifyApiError(error);
    }

    if (error.response?.status === 401 && !isAuthRoute) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
