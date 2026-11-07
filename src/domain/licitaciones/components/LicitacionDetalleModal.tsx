import React, { useEffect } from 'react';
import { X, Calendar, DollarSign, Building, FileText, CheckCircle2, Shield } from 'lucide-react';
import { Licitacion } from '../types/licitacion.types';
import { StatusBadge } from './StatusBadge';

interface LicitacionDetalleModalProps {
  licitacion: Licitacion | null;
  onClose: () => void;
}

export const LicitacionDetalleModal: React.FC<LicitacionDetalleModalProps> = ({
  licitacion,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (licitacion) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [licitacion, onClose]);

  if (!licitacion) return null;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn"
      >
        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                {licitacion.codigo}
              </span>
              <StatusBadge estado={licitacion.estado} />
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                {licitacion.categoria}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {licitacion.titulo}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-4 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-6">
          {/* Tarjetas de Datos Clave */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>Entidad</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                {licitacion.entidad}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Presupuesto</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {formatCurrency(licitacion.presupuestoEstimado, licitacion.moneda)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Fecha Cierre</span>
              </div>
              <p className="text-xs font-semibold text-slate-800">
                {licitacion.fechaCierre}
              </p>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Objeto y Alcance del Proceso
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              {licitacion.descripcion || 'Sin descripción detallada registrada.'}
            </p>
          </div>

          {/* Estadísticas de participación */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <strong>{licitacion.documentosCount}</strong> pliegos y anexos publicados
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <strong>{licitacion.propuestasCount}</strong> propuestas recibidas
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              Trazabilidad activa
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Publicada el {licitacion.fechaPublicacion}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

