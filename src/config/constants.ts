/**
 * Configuración de entorno de APIs de Limenka 360
 */

export const ISPRODUCTION: string =
  process.env.NEXT_PUBLIC_IS_PRODUCTION ??
  (process.env.NODE_ENV === 'production' ? 'true' : 'false');

export const URL: string =
  ISPRODUCTION === 'true'
    ? 'https://serviceapi.limenka360.com/'
    : 'https://apidev.limenka360.com/';

export const API_CONFIG = {
  isProduction: ISPRODUCTION === 'true',
  baseUrl: URL,
  timeout: 30000,
};

