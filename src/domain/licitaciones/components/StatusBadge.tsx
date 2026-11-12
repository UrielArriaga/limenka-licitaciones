import React from 'react';
import {
  LicitacionEstado,
  TenderDossierStatus,
  TenderDocumentStatus,
  RequirementStatus,
  ExtractionStatus,
  ProcessingJobStatus,
} from '../types/licitacion.types';

export type AnyTenderBadgeStatus =
  | LicitacionEstado
  | TenderDossierStatus
  | TenderDocumentStatus
  | RequirementStatus
  | ExtractionStatus
  | ProcessingJobStatus;

interface StatusBadgeProps {
  estado: AnyTenderBadgeStatus;
}

const estadoConfig: Record<
  AnyTenderBadgeStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  // LicitacionEstado
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

  // TenderDossierStatus
  creado: {
    label: 'Creado',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  },
  analizando: {
    label: 'Analizando IA',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500 animate-pulse',
  },
  en_revision: {
    label: 'En Revisión',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  cerrado: {
    label: 'Cerrado',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },

  // TenderDocumentStatus
  cargado: {
    label: 'Cargado',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  procesando: {
    label: 'Procesando',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500 animate-pulse',
  },
  analizado: {
    label: 'Analizado',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  error: {
    label: 'Error',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },

  // ProcessingJobStatus
  queued: {
    label: 'En Cola',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  },
  in_progress: {
    label: 'En Progreso',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500 animate-pulse',
  },
  completed: {
    label: 'Completado',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  failed: {
    label: 'Fallido',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },

  // ExtractionStatus
  pendiente_revision: {
    label: 'Pendiente Revisión',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  confirmado: {
    label: 'Confirmado',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  descartado: {
    label: 'Descartado',
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
  },

  // RequirementStatus
  pendiente: {
    label: 'Pendiente',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  },
  en_proceso: {
    label: 'En Proceso (CRM)',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  cumple: {
    label: 'Cumple',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  no_cumple: {
    label: 'No Cumple',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },
  riesgo: {
    label: 'En Riesgo',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
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


