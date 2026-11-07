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

// Modelos mapeados desde la API de Limenka360 (crm-jobs)
export interface LicitacionProject {
  id: string;
  folio?: string;
  name: string;
  prospectName?: string;
  phaseName: string;
  phaseColor?: string;
  amount: number;
  expectedDate?: string;
  assignedTo?: string;
}

export interface LicitacionOrder {
  id: string;
  folio: string;
  total: number;
  status: string;
  prospectName?: string;
  createdAt: string;
  exitstatus?: string;
}

export interface LicitacionPending {
  id: string;
  subject: string;
  description?: string;
  date_from: string;
  priority?: 'alta' | 'media' | 'baja';
  isdone?: boolean;
}

export interface LicitacionProduct {
  id: string;
  code: string;
  name: string;
  stock: number;
  stockapart?: number;
  stockassigned?: number;
  stockrepair?: number;
  amount: number;
  providerName?: string;
  categoryName?: string;
  brandName?: string;
  unit?: string;
  description?: string;
}

export interface ProductsFetchParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  search?: string;
  category?: string;
}

export interface ProductsFetchResult {
  results: LicitacionProduct[];
  total: number;
}
