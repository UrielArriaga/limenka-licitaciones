import axios from 'axios';
import { URL } from '@/config/constants';
import { useAuthStore } from '@/store/useAuthStore';

export const apiClient = axios.create({
  baseURL: URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

// Interceptor de Solicitud: Inyecta el tokenSession en cada petición
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().tokenSession;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuesta: Manejo de 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
