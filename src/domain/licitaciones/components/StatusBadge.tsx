import React from 'react';
import { LicitacionEstado } from '../types/licitacion.types';

interface StatusBadgeProps {
  estado: LicitacionEstado;
}

const estadoConfig: Record<
  LicitacionEstado,
  { label: string; bg: string; text: string; dot: string }
> = {
  borrador: {
    label: 'Borrador',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  },
  publicada: {
    label: 'Publicada',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  en_evaluacion: {
    label: 'En Evaluación',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  adjudicada: {
    label: 'Adjudicada',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  cancelada: {
    label: 'Cancelada',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ estado }) => {
  const config = estadoConfig[estado] || estadoConfig.borrador;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

