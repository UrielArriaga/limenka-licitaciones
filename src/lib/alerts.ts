import { toast } from 'sonner';

export interface FormattedError {
  title: string;
  description: string;
  statusCode?: number;
}

/**
 * Traduce y formatea cualquier error de red o de API a un mensaje amigable en español
 */
export function parseApiError(error: any): FormattedError {
  // 1. Error de Red (CORS, servidor apagado, sin internet, DNS)
  if (error?.message === 'Network Error' || !error?.response) {
    if (typeof window !== 'undefined' && !window.navigator.onLine) {
      return {
        title: 'Sin conexión a Internet',
        description: 'Parece que no tienes acceso a la red. Revisa tu conexión Wi-Fi o cable de red.',
      };
    }

    return {
      title: 'Error de Red / Conexión',
      description:
        'No se pudo establecer conexión con el servidor (apidev.limenka360.com). Verifica que el servicio esté activo y no esté bloqueado por CORS.',
    };
  }

  // 2. Timeout (La petición tardó más de 30s)
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return {
      title: 'Tiempo de espera agotado',
      description: 'El servidor tardó demasiado en responder. Por favor intenta de nuevo.',
    };
  }

  const status = error.response?.status;
  const data = error.response?.data;

  // Extraer mensaje del backend si existe
  const serverMessage =
    data?.message || data?.error || (typeof data === 'string' ? data : null);

  switch (status) {
    case 400:
      return {
        title: 'Solicitud Inválida',
        description: serverMessage || 'Los datos enviados no tienen el formato correcto.',
        statusCode: 400,
      };

    case 401:
      return {
        title: 'Credenciales Incorrectas',
        description:
          serverMessage || 'Usuario o contraseña no válidos. Verifica tus datos de acceso.',
        statusCode: 401,
      };

    case 403:
      return {
        title: 'Acceso Denegado',
        description:
          serverMessage || 'Tu rol actual no tiene autorización para realizar esta acción.',
        statusCode: 403,
      };

    case 404:
      return {
        title: 'Recurso No Encontrado',
        description: serverMessage || 'La información solicitada no existe en el servidor.',
        statusCode: 404,
      };

    case 422:
      return {
        title: 'Error de Validación',
        description: serverMessage || 'Revisa los campos del formulario.',
        statusCode: 422,
      };

    case 500:
    case 502:
    case 503:
    case 504:
      return {
        title: 'Error del Servidor',
        description:
          'El servicio de Limenka 360 experimenta problemas técnicos temporales. Intenta más tarde.',
        statusCode: status,
      };

    default:
      return {
        title: 'Error Inesperado',
        description: serverMessage || error.message || 'Ocurrió un error al procesar la solicitud.',
        statusCode: status,
      };
  }
}

/**
 * Muestra automáticamente una alerta toast amigable basada en el error capturado
 */
export function notifyApiError(error: any): FormattedError {
  const formatted = parseApiError(error);

  toast.error(formatted.title, {
    description: formatted.description,
    duration: 5000,
  });

  return formatted;
}

export { toast };

