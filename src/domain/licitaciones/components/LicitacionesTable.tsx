import React from 'react';
import { Licitacion } from '../types/licitacion.types';
import { StatusBadge } from './StatusBadge';
import {
  FileText,
  Calendar,
  Building2,
  DollarSign,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';

interface LicitacionesTableProps {
  licitaciones: Licitacion[];
  onSelectLicitacion?: (licitacion: Licitacion) => void;
}

export const LicitacionesTable: React.FC<LicitacionesTableProps> = ({
  licitaciones,
  onSelectLicitacion,
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (licitaciones.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <FolderOpen className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800">
          No se encontraron licitaciones
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          Intenta ajustar los filtros de búsqueda, estado o categoría para encontrar lo que buscas.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200/80">
            <tr>
              <th className="py-3.5 px-5">Proceso / Licitación</th>
              <th className="py-3.5 px-4">Entidad Convocante</th>
              <th className="py-3.5 px-4">Categoría</th>
              <th className="py-3.5 px-4 text-right">Presupuesto</th>
              <th className="py-3.5 px-4">Fecha Cierre</th>
              <th className="py-3.5 px-4 text-center">Estado</th>
              <th className="py-3.5 px-5 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {licitaciones.map((lic) => (
              <tr
                key={lic.id}
                className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                onClick={() => onSelectLicitacion?.(lic)}
              >
                {/* Código y Título */}
                <td className="py-4 px-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-semibold text-blue-600 block">
                        {lic.codigo}
                      </span>
                      <h4 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 max-w-md">
                        {lic.titulo}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1 max-w-md mt-0.5">
                        {lic.descripcion}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Entidad */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-slate-700 text-xs font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="max-w-[180px] truncate" title={lic.entidad}>
                      {lic.entidad}
                    </span>
                  </div>
                </td>

                {/* Categoría */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                    {lic.categoria}
                  </span>
                </td>

                {/* Presupuesto */}
                <td className="py-4 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1 font-semibold text-slate-900">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{formatCurrency(lic.presupuestoEstimado, lic.moneda)}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">{lic.moneda}</span>
                </td>

                {/* Fecha Cierre */}
                <td className="py-4 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(lic.fechaCierre)}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {lic.propuestasCount} propuestas recibidas
                  </span>
                </td>

                {/* Estado */}
                <td className="py-4 px-4 text-center whitespace-nowrap">
                  <StatusBadge estado={lic.estado} />
                </td>

                {/* Acción */}
                <td className="py-4 px-5 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLicitacion?.(lic);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver detalles"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

