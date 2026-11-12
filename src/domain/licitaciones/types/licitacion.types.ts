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

// ============================================================================
// SPEC-TENDER-LIFECYCLE-02: Expediente Inteligente de Licitaciones
// ============================================================================

export type TenderDossierStatus = 'creado' | 'analizando' | 'en_revision' | 'cerrado';

export type TenderDocumentStatus = 'cargado' | 'procesando' | 'analizado' | 'error';

export type ProcessingJobStatus = 'queued' | 'in_progress' | 'completed' | 'failed';

export type ExtractionStatus = 'pendiente_revision' | 'confirmado' | 'descartado';

export type ExtractionCategory =
  | 'identificacion'
  | 'calendario'
  | 'economico'
  | 'riesgos'
  | 'otros';

export type RequirementStatus = 'pendiente' | 'en_proceso' | 'cumple' | 'no_cumple' | 'riesgo';

export type RequirementCategory = 'legal' | 'tecnico' | 'financiero' | 'administrativo';

export type TenderAuditAction =
  | 'UPLOAD'
  | 'CONFIRM_EXTRACTION'
  | 'EDIT_FIELD'
  | 'GENERATE_TASK';

export interface TenderDossier {
  id: string;
  projectId: string;
  title?: string;
  tenderCode?: string;
  issuingEntity?: string;
  status: TenderDossierStatus;
  currentVersion?: number;
  createdById?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTenderDossierDto {
  projectId: string;
  status?: TenderDossierStatus;
  currentVersion?: number;
  createdById: string;
}

export type TenderDocumentFileType = 'pliego' | 'anexo' | 'aclaracion' | 'propuesta' | string;

export interface TenderDocument {
  id: string;
  dossierId: string;
  fileId: string;
  filename: string;
  fileType: TenderDocumentFileType;
  checksum: string;
  version: number;
  processingStatus: TenderDocumentStatus;
  errorMessage?: string;
  createdAt: string;
  updatedAt?: string;
  // Propiedades opcionales de compatibilidad UI
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
  fileSizeBytes?: number;
  pageCount?: number;
  status?: TenderDocumentStatus;
  uploadedBy?: string;
}

export interface CreateTenderDocumentDto {
  dossierId: string;
  fileId?: string;
  filename: string;
  fileType: TenderDocumentFileType;
  checksum: string;
  version: number;
  processingStatus: TenderDocumentStatus;
  errorMessage?: string;
}

export interface ProcessingJob {
  id: string;
  dossierId: string;
  documentId: string;
  jobType: 'ocr_extraction_rag';
  status: ProcessingJobStatus;
  progressPercentage: number;
  currentStep: string;
  errorLog?: string | null;
  attempts?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProcessingJobDto {
  dossierId: string;
  documentId: string;
  jobType?: 'ocr_extraction_rag';
  status?: ProcessingJobStatus;
  progressPercentage?: number;
  currentStep?: string;
  errorLog?: string;
  attempts?: number;
}

export interface TenderExtraction {
  id: string;
  dossierId: string;
  documentId: string;
  category: ExtractionCategory;
  fieldKey: string;
  valueJson: any;
  value?: any;
  originalValue?: any;
  isUserEdited?: boolean;
  userEditedValue?: any;
  confidence: number;
  sourcePage: number;
  status: ExtractionStatus;
  documentFilename?: string;
}

export interface RequirementEvidence {
  id: string;
  requirementId: string;
  documentId: string;
  pageNumber: number;
  quoteText: string;
  notes?: string;
}

export interface CreateRequirementEvidenceDto {
  requirementId: string;
  documentId: string;
  pageNumber: number;
  quoteText: string;
  notes?: string;
}

export interface TenderRequirement {
  id: string;
  dossierId: string;
  category: RequirementCategory;
  title: string;
  description: string;
  isMandatory: boolean;
  dueDate: string;
  ownerId: string;
  status: RequirementStatus;
  pendingId?: string;
  evidence?: RequirementEvidence[];
}

export interface CreateTenderRequirementDto {
  dossierId: string;
  category: RequirementCategory;
  title: string;
  description: string;
  isMandatory: boolean;
  dueDate: string;
  ownerId: string;
  status?: RequirementStatus;
}

export interface CreatePendingFromRequirementDto {
  ownerId: string;
  dueDate: string;
  notes: string;
}

export interface CreatePendingFromRequirementResponse {
  message: string;
  pendingId: string;
  requirementId: string;
  status: 'en_proceso';
}

export interface QuestionCitation {
  id?: string;
  questionId?: string;
  documentId: string;
  filename?: string;
  page?: number;
  pageNumber: number;
  chunkId?: string;
  excerpt: string;
  score?: number;
  relevanceScore: number;
}

export interface TenderQuestion {
  id: string;
  questionId?: string;
  dossierId: string;
  question: string;
  answer: string;
  confidence?: string;
  warnings?: string[];
  askedBy?: string;
  createdAt?: string;
  citations: QuestionCitation[];
}

export interface TenderAuditLog {
  id: string;
  dossierId: string;
  actorId: string;
  action: TenderAuditAction;
  entityName: string;
  entityId: string;
  beforeJson: Record<string, any> | null;
  afterJson: Record<string, any> | null;
  createdAt: string;
}

export interface CreateTenderAuditLogDto {
  dossierId: string;
  actorId: string;
  action: TenderAuditAction;
  entityName: string;
  entityId: string;
  beforeJson: Record<string, any> | null;
  afterJson: Record<string, any> | null;
}

export interface DossierAnalysisConsolidado {
  dossierId?: string;
  totalExtractions?: number;
  analysis?: Record<string, any>;
  dossier?: TenderDossier | null;
  documents: TenderDocument[];
  activeJob?: ProcessingJob | null;
  extractions: TenderExtraction[];
  requirements: TenderRequirement[];
  questions?: TenderQuestion[];
}

