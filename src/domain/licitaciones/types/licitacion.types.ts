export type LicitacionEstado =
  | 'borrador'
  | 'publicada'
  | 'en_evaluacion'
  | 'adjudicada'
  | 'cancelada';

export type LicitacionCategoria =
  | 'Salud'
  | 'Infraestructura'
  | 'Tecnología'
  | 'Servicios'
  | 'Suministros';

export interface Licitacion {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  entidad: string;
  categoria: LicitacionCategoria;
  estado: LicitacionEstado;
  presupuestoEstimado: number;
  moneda: 'MXN' | 'USD';
  fechaPublicacion: string;
  fechaCierre: string;
  propuestasCount: number;
  documentosCount: number;
}

export interface CreateLicitacionDto {
  titulo: string;
  descripcion: string;
  entidad: string;
  categoria: LicitacionCategoria;
  presupuestoEstimado: number;
  moneda: 'MXN' | 'USD';
  fechaCierre: string;
}

export interface LicitacionesFilterOptions {
  search?: string;
  estado?: LicitacionEstado | 'todas';
  categoria?: LicitacionCategoria | 'todas';
}

