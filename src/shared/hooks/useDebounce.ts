import { useState, useEffect } from 'react';

/**
 * Hook para pausar la ejecución de búsquedas o peticiones costosas
 * hasta que el usuario termine de escribir (debounce).
 *
 * @param value Valor que cambia con cada tecla (ej. término del input)
 * @param delay Milisegundos de espera tras la última pulsación (por defecto 400ms)
 * @returns El valor estabilizado una vez que cesa la escritura
 */
export function useDebounce<T>(value: T, delay: number = 450): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

