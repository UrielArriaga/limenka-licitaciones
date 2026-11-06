import { useState, useEffect, useCallback } from 'react';
import {
  Licitacion,
  CreateLicitacionDto,
  LicitacionesFilterOptions,
} from '../types/licitacion.types';
import { licitacionesService } from '../services/licitacionesService';

export const useLicitaciones = () => {
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<LicitacionesFilterOptions>({
    search: '',
    estado: 'todas',
    categoria: 'todas',
  });
  const [selectedLicitacion, setSelectedLicitacion] = useState<Licitacion | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const fetchLicitaciones = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await licitacionesService.getAll(filters);
      setLicitaciones(data);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLicitaciones();
  }, [fetchLicitaciones]);

  const handleCreate = async (dto: CreateLicitacionDto) => {
    const nueva = await licitacionesService.create(dto);
    await fetchLicitaciones();
    return nueva;
  };

  return {
    licitaciones,
    isLoading,
    filters,
    setFilters,
    selectedLicitacion,
    setSelectedLicitacion,
    isCreateModalOpen,
    setIsCreateModalOpen,
    createLicitacion: handleCreate,
    refresh: fetchLicitaciones,
  };
};

