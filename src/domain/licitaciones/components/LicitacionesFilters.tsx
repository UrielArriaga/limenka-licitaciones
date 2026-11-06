import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import {
  LicitacionCategoria,
  LicitacionEstado,
  LicitacionesFilterOptions,
} from '../types/licitacion.types';

interface LicitacionesFiltersProps {
  filters: LicitacionesFilterOptions;
  onChange: (filters: LicitacionesFilterOptions) => void;
  totalResults: number;
}

const ESTADOS: { value: LicitacionEstado | 'todas'; label: string }[] = [
  { value: 'todas', label: 'Todos los estados' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'publicada', label: 'Publicadas' },
  { value: 'en_evaluacion', label: 'En Evaluación' },
  { value: 'adjudicada', label: 'Adjudicadas' },
  { value: 'cancelada', label: 'Canceladas' },
];

const CATEGORIAS: { value: LicitacionCategoria | 'todas'; label: string }[] = [
  { value: 'todas', label: 'Todas las categorías' },
  { value: 'Salud', label: 'Salud' },
  { value: 'Infraestructura', label: 'Infraestructura' },
  { value: 'Tecnología', label: 'Tecnología' },
  { value: 'Servicios', label: 'Servicios' },
  { value: 'Suministros', label: 'Suministros' },
];

export const LicitacionesFilters: React.FC<LicitacionesFiltersProps> = ({
  filters,
  onChange,
  totalResults,
}) => {
  const hasActiveFilters =
    Boolean(filters.search) ||
    (filters.estado && filters.estado !== 'todas') ||
    (filters.categoria && filters.categoria !== 'todas');

  const handleReset = () => {
    onChange({
      search: '',
      estado: 'todas',
      categoria: 'todas',
    });
  };

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Buscador de texto */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por título, código (LIC-...) o entidad convocante..."
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>

        {/* Filtros desplegables */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Selector de Estado */}
          <select
            value={filters.estado || 'todas'}
            onChange={(e) =>
              onChange({
                ...filters,
                estado: e.target.value as LicitacionEstado | 'todas',
              })
            }
            className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
          >
            {ESTADOS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>

          {/* Selector de Categoría */}
          <select
            value={filters.categoria || 'todas'}
            onChange={(e) =>
              onChange({
                ...filters,
                categoria: e.target.value as LicitacionCategoria | 'todas',
              })
            }
            className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
          >
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Botón Reset */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors flex items-center gap-1.5"
              title="Limpiar filtros"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>
            Mostrando <strong>{totalResults}</strong> proceso{totalResults !== 1 ? 's' : ''}
          </span>
        </span>
      </div>
    </div>
  );
};

