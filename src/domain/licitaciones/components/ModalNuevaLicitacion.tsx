import React, { useState, useEffect } from 'react';
import { X, Plus, DollarSign, Calendar, Building, FileText, Loader2 } from 'lucide-react';
import { CreateLicitacionDto, LicitacionCategoria } from '../types/licitacion.types';

interface ModalNuevaLicitacionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateLicitacionDto) => Promise<any>;
}

const CATEGORIAS: LicitacionCategoria[] = [
  'Salud',
  'Infraestructura',
  'Tecnología',
  'Servicios',
  'Suministros',
];

export const ModalNuevaLicitacion: React.FC<ModalNuevaLicitacionProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [titulo, setTitulo] = useState('');
  const [entidad, setEntidad] = useState('');
  const [categoria, setCategoria] = useState<LicitacionCategoria>('Salud');
  const [presupuestoEstimado, setPresupuestoEstimado] = useState<number | ''>('');
  const [moneda, setMoneda] = useState<'MXN' | 'USD'>('MXN');
  const [fechaCierre, setFechaCierre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !entidad || !presupuestoEstimado || !fechaCierre) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        titulo,
        entidad,
        categoria,
        presupuestoEstimado: Number(presupuestoEstimado),
        moneda,
        fechaCierre,
        descripcion,
      });
      // Limpiar formulario y cerrar
      setTitulo('');
      setEntidad('');
      setPresupuestoEstimado('');
      setDescripcion('');
      setFechaCierre('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn"
      >
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Crear Nueva Licitación</h3>
              <p className="text-xs text-slate-500">Registrar un nuevo proceso licitatorio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Título de la Licitación */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Título del Proceso *
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                required
                placeholder="Ej. Adquisición de Equipos Médicos para Hospital General..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Entidad Convocante & Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Entidad Convocante *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Secretaría de Salud"
                  value={entidad}
                  onChange={(e) => setEntidad(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Categoría *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as LicitacionCategoria)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer bg-white"
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Presupuesto y Moneda */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Presupuesto Estimado *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  placeholder="Ej. 5000000"
                  value={presupuestoEstimado}
                  onChange={(e) => setPresupuestoEstimado(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Moneda
              </label>
              <select
                value={moneda}
                onChange={(e) => setMoneda(e.target.value as 'MXN' | 'USD')}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer bg-white"
              >
                <option value="MXN">MXN ($)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          {/* Fecha de Cierre */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Fecha de Cierre de Propuestas *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="date"
                required
                value={fechaCierre}
                onChange={(e) => setFechaCierre(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Descripción corta */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Descripción o Alcance
            </label>
            <textarea
              rows={3}
              placeholder="Detalles sobre el objeto de la contratación, requisitos preliminares o entregables..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Crear Licitación</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

