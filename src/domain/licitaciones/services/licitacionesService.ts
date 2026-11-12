import { apiClient } from '@/lib/apiClient';
import {
  Licitacion,
  CreateLicitacionDto,
  LicitacionesFilterOptions,
  LicitacionProject,
  LicitacionOrder,
  LicitacionPending,
  LicitacionProduct,
  ProductsFetchParams,
  ProductsFetchResult,
  TenderDossier,
  CreateTenderDossierDto,
  TenderDocument,
  CreateTenderDocumentDto,
  ProcessingJob,
  CreateProcessingJobDto,
  TenderExtraction,
  ExtractionStatus,
  TenderRequirement,
  RequirementStatus,
  CreateTenderRequirementDto,
  RequirementEvidence,
  CreateRequirementEvidenceDto,
  CreatePendingFromRequirementDto,
  CreatePendingFromRequirementResponse,
  TenderQuestion,
  QuestionCitation,
  TenderAuditLog,
  CreateTenderAuditLogDto,
  DossierAnalysisConsolidado,
} from '../types/licitacion.types';

/**
 * Calcula el hash SHA-256 de un archivo local utilizando Web Crypto API
 */
export async function calculateFileChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Helper interno para consultar oportunidades reales desde el backend de Limenka
 * probando tanto /oportunities como /oportunities/refactor y leyendo results.
 */
async function fetchBackendOpportunities(limit = 30): Promise<any[]> {
  try {
    const response = await apiClient.get('/oportunities', {
      params: { limit, count: 1, include: 'prospect,phase' },
      skipGlobalErrorAlert: true,
    });
    const list =
      response.data?.results ||
      response.data?.data ||
      (Array.isArray(response.data) ? response.data : []);
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
  } catch {
    // Continuar con /oportunities/refactor si /oportunities requiere otros parámetros
  }

  try {
    const response = await apiClient.get('/oportunities/refactor', {
      params: { limit, count: 1 },
      skipGlobalErrorAlert: true,
    });
    const list =
      response.data?.results ||
      response.data?.data ||
      (Array.isArray(response.data) ? response.data : []);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export const licitacionesService = {
  // Licitaciones base conectadas a las oportunidades reales del backend (IDs reales de 24 caracteres)
  async getAll(filters?: LicitacionesFilterOptions): Promise<Licitacion[]> {
    const list = await fetchBackendOpportunities(40);

    let result: Licitacion[] = list.map((item: any) => {
      const realId = String(item.id || item._id || '');
      const phaseName = String(item.phase?.name || '').toLowerCase();

      let estado: Licitacion['estado'] = 'publicada';
      if (
        item.iscloseout ||
        phaseName.includes('adjudica') ||
        phaseName.includes('ganad')
      ) {
        estado = 'adjudicada';
      } else if (
        phaseName.includes('eval') ||
        phaseName.includes('propuesta') ||
        phaseName.includes('fallo') ||
        phaseName.includes('revisi')
      ) {
        estado = 'en_evaluacion';
      } else if (
        phaseName.includes('desiert') ||
        phaseName.includes('perdid') ||
        phaseName.includes('cancel')
      ) {
        estado = 'cancelada';
      }

      const entityName =
        item.prospect?.name ||
        item.prospect?.companyname ||
        item.oportunity?.prospect?.name ||
        'Entidad Convocante';

      const title =
        item.concept ||
        item.name ||
        item.oportunity?.name ||
        item.oportunity?.concept ||
        `Licitación ${item.folio || realId.slice(0, 8)}`;

      return {
        id: realId,
        codigo: item.folio || item.concept || `LIC-${realId.slice(0, 6)}`,
        titulo: title,
        descripcion:
          item.observations ||
          item.description ||
          `Expediente vinculado al proyecto ${realId}`,
        entidad: entityName,
        categoria: item.category?.name || 'Salud',
        estado,
        presupuestoEstimado: Number(item.amount || item.total || 0),
        moneda: 'MXN',
        fechaPublicacion: item.createdAt ? String(item.createdAt).split('T')[0] : '',
        fechaCierre: item.estimatedclossing
          ? String(item.estimatedclossing).split('T')[0]
          : item.expected_close_date
            ? String(item.expected_close_date).split('T')[0]
            : '',
        propuestasCount: Number(item.quantity || 0),
        documentosCount: 0,
      };
    });

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.titulo.toLowerCase().includes(q) ||
          l.codigo.toLowerCase().includes(q) ||
          l.entidad.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q)
      );
    }

    if (filters?.estado && filters.estado !== 'todas') {
      result = result.filter((l) => l.estado === filters.estado);
    }

    if (filters?.categoria && filters.categoria !== 'todas') {
      result = result.filter((l) => l.categoria === filters.categoria);
    }

    return result;
  },

  async create(dto: CreateLicitacionDto): Promise<Licitacion> {
    const response = await apiClient.post('/oportunities', {
      concept: dto.titulo,
      amount: dto.presupuestoEstimado,
      estimatedclossing: dto.fechaCierre,
      observations: dto.descripcion,
    });
    const created =
      response.data?.results?.[0] ||
      response.data?.oportunity ||
      response.data?.data ||
      response.data;

    const realId = String(created?.id || created?._id || '');
    return {
      id: realId,
      codigo: created?.folio || dto.titulo.slice(0, 12).toUpperCase(),
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      entidad: dto.entidad,
      categoria: dto.categoria,
      presupuestoEstimado: dto.presupuestoEstimado,
      moneda: dto.moneda,
      fechaPublicacion: new Date().toISOString().split('T')[0],
      fechaCierre: dto.fechaCierre,
      estado: 'publicada',
      propuestasCount: 0,
      documentosCount: 0,
    };
  },

  // 1. Proyectos de Licitaciones (/oportunities y /oportunities/refactor)
  async getProjects(): Promise<LicitacionProject[]> {
    const list = await fetchBackendOpportunities(30);

    return list.map((item: any) => ({
      id: String(item.id || item._id || ''),
      folio:
        item.folio ||
        item.concept ||
        `PRJ-${String(item.id || item._id || '').substring(0, 6)}`,
      name:
        item.concept ||
        item.name ||
        item.oportunity?.name ||
        item.oportunity?.concept ||
        'Proyecto de Licitación',
      prospectName:
        item.prospect?.name ||
        item.prospect?.companyname ||
        item.oportunity?.prospect?.name ||
        'Entidad Pública',
      phaseName: item.phase?.name || 'Revisión de Bases',
      amount: Number(item.amount || item.total || 0),
      expectedDate: item.estimatedclossing
        ? String(item.estimatedclossing).split('T')[0]
        : item.expected_close_date
          ? String(item.expected_close_date).split('T')[0]
          : item.createdAt
            ? String(item.createdAt).split('T')[0]
            : '',
      assignedTo:
        item.prospect?.ejecutive?.name ||
        item.ejecutive?.name ||
        item.soldby?.name ||
        'Responsable Licitaciones',
    }));
  },

  // 2. Órdenes / Pedidos (/orders)
  async getOrders(): Promise<LicitacionOrder[]> {
    const response = await apiClient.get('/orders', {
      params: { limit: 15, count: 1 },
    });
    const list =
      response.data?.results ||
      response.data?.data ||
      (Array.isArray(response.data) ? response.data : []);

    if (!Array.isArray(list)) return [];

    return list.map((item: any) => ({
      id: String(item.id || item._id || ''),
      folio: item.folio || `ORD-${String(item.id || '').substring(0, 6)}`,
      total: Number(item.total || 0),
      status: item.orderstatus?.name || 'Recibido',
      prospectName: item.oportunity?.prospect?.name || 'Cliente Institucional',
      createdAt: item.createdAt ? String(item.createdAt).split('T')[0] : '',
      exitstatus: item.exitstatus || 'En proceso',
    }));
  },

  // 3. Pendientes y Calendario (/pendings)
  async getPendings(): Promise<LicitacionPending[]> {
    const response = await apiClient.get('/pendings', {
      params: { count: 1, limit: 15 },
    });
    const list =
      response.data?.results ||
      response.data?.data ||
      (Array.isArray(response.data) ? response.data : []);

    if (!Array.isArray(list)) return [];

    return list.map((p: any) => ({
      id: String(p.id || p._id || ''),
      subject: p.subject || 'Actividad de Licitación',
      description: p.description || '',
      date_from: p.date_from ? String(p.date_from).split('T')[0] : '',
      priority: p.priority || 'alta',
      isdone: Boolean(p.isdone),
    }));
  },

  // 4. Catálogo de Productos (/products)
  async getProducts(params?: ProductsFetchParams): Promise<ProductsFetchResult> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const orderBy = params?.orderBy ?? '-stock';
    const search = params?.search?.trim() ?? '';
    const category = params?.category?.trim() ?? '';

    const query: Record<string, any> = {
      isactive: true,
    };

    if (search.length > 0) {
      query.$or = [
        { code: { $iRegexp: search } },
        { name: { $iRegexp: search } },
      ];
    }

    if (category && category !== 'todas') {
      query['category.name'] = category;
    }

    const response = await apiClient.get('/products', {
      params: {
        include: 'category,brand,provider',
        limit,
        skip: page,
        count: 1,
        order: orderBy,
        where: JSON.stringify(query),
      },
    });

    const results =
      response.data?.results ||
      response.data?.data ||
      (Array.isArray(response.data) ? response.data : []);

    const totalCount =
      response.data?.count ??
      response.data?.total ??
      (Array.isArray(results) ? results.length : 0);

    if (!Array.isArray(results)) {
      return { results: [], total: 0 };
    }

    const normalized: LicitacionProduct[] = results.map((prod: any) => ({
      id: String(prod.id || prod._id || ''),
      code: prod.code || 'SKU-000',
      name: prod.name || 'Producto',
      stock: Math.max(0, Number(prod.stock) || 0),
      stockapart: Math.max(0, Number(prod.stockapart) || 0),
      stockassigned: Math.max(0, Number(prod.stockassigned) || 0),
      stockrepair: Math.max(0, Number(prod.stockrepair) || 0),
      amount: Number(prod.callamount || prod.amount || prod.storeamount || 0),
      providerName:
        prod.provider?.name || prod.provider?.companyname || 'Proveedor',
      categoryName: prod.category?.name || 'General',
      brandName: prod.brand?.name || 'Genérico',
      unit: prod.unit || 'Pza',
      description: prod.description || '',
    }));

    return { results: normalized, total: totalCount };
  },

  // ============================================================================
  // SPEC-TENDER-LIFECYCLE-02: Expediente Inteligente de Licitaciones (100% API)
  // ============================================================================

  calculateFileChecksum,

  // 1. Expediente y Documentos
  async getDossierByProjectId(projectId: string): Promise<TenderDossier | null> {
    if (!projectId) return null;
    try {
      const response = await apiClient.get('/tender_dossiers', {
        params: {
          limit: 50,
        },
        skipGlobalErrorAlert: true,
      });
      const list =
        response.data?.results ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);
      if (Array.isArray(list) && list.length > 0) {
        const match = list.find(
          (d: any) => d.projectId === projectId || d.id === projectId
        );
        return match || null;
      }
      return null;
    } catch {
      return null;
    }
  },

  async createDossier(payload: CreateTenderDossierDto): Promise<TenderDossier> {
    const cleanBody = {
      projectId: payload.projectId,
      status: payload.status || 'creado',
      currentVersion: payload.currentVersion ?? 1,
      createdById: payload.createdById || (payload as any).createdBy,
    };
    const response = await apiClient.post('/tender_dossiers', cleanBody);
    const data =
      response.data?.results?.[0] ||
      response.data?.dossier ||
      response.data?.data ||
      response.data;

    if (data?.id) {
      return data;
    }

    const fetched = await this.getDossierByProjectId(payload.projectId);
    return fetched || data;
  },

  async deleteDossier(dossierId: string): Promise<any> {
    const response = await apiClient.delete(`/tender_dossiers/${dossierId}`);
    return response.data?.results?.[0] || response.data?.data || response.data;
  },

  /**
   * Obtiene un fileId real de 24 caracteres existente en el backend (/files o /tender_documents)
   * cuando no se cuenta aún con un ID de archivo devuelto por el servicio de storage.
   */
  async resolveBackendFileId(providedFileId?: string): Promise<string> {
    if (
      providedFileId &&
      !providedFileId.startsWith('FILE_DOC_') &&
      providedFileId.length >= 20
    ) {
      return providedFileId;
    }

    try {
      const filesRes = await apiClient.get('/files', {
        params: { limit: 1 },
        skipGlobalErrorAlert: true,
      });
      const filesList =
        filesRes.data?.results ||
        filesRes.data?.data ||
        (Array.isArray(filesRes.data) ? filesRes.data : []);
      const firstFileId = filesList?.[0]?.id || filesList?.[0]?._id;
      if (firstFileId) {
        return String(firstFileId);
      }
    } catch {
      // Continuar con /tender_documents si /files no está disponible
    }

    try {
      const docsRes = await apiClient.get('/tender_documents', {
        params: { limit: 5 },
        skipGlobalErrorAlert: true,
      });
      const docsList =
        docsRes.data?.results ||
        docsRes.data?.data ||
        (Array.isArray(docsRes.data) ? docsRes.data : []);
      const existingFileId = docsList?.find((d: any) => d?.fileId)?.fileId;
      if (existingFileId) {
        return String(existingFileId);
      }
    } catch {
      // Ignorar error de consulta previa
    }

    return providedFileId || '';
  },

  async getDocumentsByDossierId(dossierId: string): Promise<TenderDocument[]> {
    if (!dossierId) return [];
    try {
      const response = await apiClient.get('/tender_documents', {
        params: { limit: 50 },
        skipGlobalErrorAlert: true,
      });
      const list =
        response.data?.results ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);
      if (!Array.isArray(list)) return [];
      return list.filter((doc: any) => doc.dossierId === dossierId);
    } catch {
      return [];
    }
  },

  async registerDocument(payload: CreateTenderDocumentDto): Promise<TenderDocument> {
    const validFileId = await this.resolveBackendFileId(payload.fileId);

    const cleanBody = {
      dossierId: String(payload.dossierId).trim(),
      fileId: validFileId,
      filename: String(payload.filename).trim(),
      fileType: payload.fileType || 'pliego',
      checksum: String(payload.checksum).trim(),
      version: Number(payload.version ?? 1),
      processingStatus: payload.processingStatus || 'cargado',
      errorMessage: payload.errorMessage ?? '',
    };

    const response = await apiClient.post('/tender_documents', cleanBody);
    const created =
      response.data?.results?.[0] ||
      response.data?.document ||
      response.data?.data ||
      response.data;

    if (created?.id) {
      return created;
    }

    const docs = await this.getDocumentsByDossierId(cleanBody.dossierId);
    return (
      docs.find((d) => d.checksum === cleanBody.checksum || d.filename === cleanBody.filename) ||
      docs[0] ||
      created
    );
  },

  async deleteDocument(documentId: string): Promise<any> {
    const response = await apiClient.delete(`/tender_documents/${documentId}`);
    return response.data?.results?.[0] || response.data?.data || response.data;
  },

  // 2. Disparo Asíncrono y Monitoreo (processing_jobs)
  async getProcessingJobsByDossierId(dossierId: string): Promise<ProcessingJob[]> {
    if (!dossierId) return [];
    try {
      const response = await apiClient.get('/processing_jobs', {
        params: { limit: 50 },
        skipGlobalErrorAlert: true,
      });
      const list =
        response.data?.results ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);
      if (!Array.isArray(list)) return [];
      return list.filter((job: any) => job.dossierId === dossierId);
    } catch {
      return [];
    }
  },

  async processDocument(
    documentId: string,
    dossierId?: string
  ): Promise<ProcessingJob> {
    const response = await apiClient.post(`/tender_analysis/process/${documentId}`, {});
    const raw =
      response.data?.results?.[0] ||
      response.data?.job ||
      response.data?.data ||
      response.data;

    // El endpoint POST /tender_analysis/process/:documentId devuelve:
    // { documentId, jobId, message, status: "queued" }
    const resolvedJobId = String(raw?.jobId || raw?.id || raw?.job?.id || '');
    return {
      id: resolvedJobId,
      dossierId: String(raw?.dossierId || dossierId || ''),
      documentId: String(raw?.documentId || documentId),
      jobType: raw?.jobType || 'ocr_extraction_rag',
      status: raw?.status || 'queued',
      progressPercentage: Number(raw?.progressPercentage ?? 5),
      currentStep:
        raw?.currentStep || raw?.message || 'Documento encolado para procesamiento',
      errorLog: raw?.errorLog ?? '',
      attempts: Number(raw?.attempts ?? 0),
    };
  },

  async createProcessingJob(payload: CreateProcessingJobDto): Promise<ProcessingJob> {
    const cleanBody = {
      dossierId: String(payload.dossierId).trim(),
      documentId: String(payload.documentId).trim(),
      jobType: payload.jobType || 'ocr_extraction_rag',
      status: payload.status || 'queued',
      progressPercentage: Number(payload.progressPercentage ?? 0),
      currentStep: payload.currentStep ?? '',
      errorLog: payload.errorLog ?? '',
      attempts: Number(payload.attempts ?? 0),
    };

    const response = await apiClient.post('/processing_jobs', cleanBody);
    const created =
      response.data?.results?.[0] ||
      response.data?.job ||
      response.data?.data ||
      response.data;

    if (created?.id) {
      return created;
    }

    const jobs = await this.getProcessingJobsByDossierId(cleanBody.dossierId);
    return (
      jobs.find((j) => j.documentId === cleanBody.documentId) ||
      jobs[0] ||
      created
    );
  },

  async getProcessingJob(
    jobId: string,
    dossierId?: string,
    documentId?: string
  ): Promise<ProcessingJob> {
    let found: any = null;

    if (jobId) {
      try {
        const response = await apiClient.get(`/processing_jobs/${jobId}`, {
          skipGlobalErrorAlert: true,
        });
        const resultsList = response.data?.results;
        if (Array.isArray(resultsList)) {
          found =
            resultsList.find((j: any) => j.id === jobId || j.jobId === jobId) ||
            resultsList[0];
        } else {
          found =
            response.data?.job ||
            response.data?.data ||
            response.data;
        }
      } catch {
        // Fallback al listado /processing_jobs si /:jobId falla
      }
    }

    if (!found || !found.status) {
      try {
        const listRes = await apiClient.get('/processing_jobs', {
          params: { limit: 50 },
          skipGlobalErrorAlert: true,
        });
        const list =
          listRes.data?.results ||
          listRes.data?.data ||
          (Array.isArray(listRes.data) ? listRes.data : []);
        if (Array.isArray(list)) {
          found =
            list.find((j: any) => j.id === jobId) ||
            (documentId ? list.find((j: any) => j.documentId === documentId) : null) ||
            (dossierId ? list.find((j: any) => j.dossierId === dossierId) : null);
        }
      } catch {
        // Ignorar
      }
    }

    return {
      id: String(found?.id || found?.jobId || jobId),
      dossierId: String(found?.dossierId || dossierId || ''),
      documentId: String(found?.documentId || documentId || ''),
      jobType: found?.jobType || 'ocr_extraction_rag',
      status: found?.status || 'in_progress',
      progressPercentage: Number(found?.progressPercentage ?? 0),
      currentStep: found?.currentStep || found?.message || '',
      errorLog: found?.errorLog ?? '',
      attempts: Number(found?.attempts ?? 0),
      createdAt: found?.createdAt,
      updatedAt: found?.updatedAt,
    };
  },

  // 3. Análisis Consolidado y Extracciones IA
  normalizeExtractionItem(
    ext: any,
    fallbackDossierId: string,
    fallbackCategory?: string
  ): TenderExtraction {
    let rawValue = ext?.value !== undefined ? ext.value : ext?.valueJson;
    if (typeof rawValue === 'string') {
      try {
        rawValue = JSON.parse(rawValue);
      } catch {
        // Mantener string original si no es JSON válido
      }
    }

    let rawEdited =
      ext?.userEditedValue !== undefined
        ? ext.userEditedValue
        : ext?.isUserEdited
          ? rawValue
          : undefined;
    if (typeof rawEdited === 'string') {
      try {
        rawEdited = JSON.parse(rawEdited);
      } catch {
        // Mantener string original
      }
    }

    const rawCat = String(ext?.category || fallbackCategory || 'otros').toLowerCase();
    const validCategories = [
      'identificacion',
      'calendario',
      'economico',
      'riesgos',
      'otros',
    ];
    const resolvedCategory = (
      validCategories.includes(rawCat) ? rawCat : 'otros'
    ) as TenderExtraction['category'];

    return {
      id: String(
        ext?.id || ext?._id || `${resolvedCategory}-${ext?.fieldKey || 'item'}`
      ),
      dossierId: String(ext?.dossierId || fallbackDossierId || ''),
      documentId: String(ext?.documentId || ''),
      category: resolvedCategory,
      fieldKey: String(ext?.fieldKey || resolvedCategory),
      valueJson: rawValue,
      value: rawValue,
      originalValue: ext?.originalValue,
      isUserEdited: Boolean(
        ext?.isUserEdited || (rawEdited !== undefined && rawEdited !== null)
      ),
      userEditedValue: rawEdited,
      confidence: Number(ext?.confidence ?? 0),
      sourcePage: Number(ext?.sourcePage ?? rawValue?.source_page ?? 1),
      status: ext?.status || 'pendiente_revision',
      documentFilename: ext?.documentFilename || ext?.document?.filename,
    };
  },

  async getExtractionsByDossierId(dossierId: string): Promise<TenderExtraction[]> {
    if (!dossierId) return [];
    try {
      const response = await apiClient.get('/tender_extractions', {
        params: { limit: 100 },
        skipGlobalErrorAlert: true,
      });
      const list =
        response.data?.results ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);
      if (!Array.isArray(list)) return [];
      return list
        .filter((ext: any) => ext.dossierId === dossierId)
        .map((ext: any) =>
          this.normalizeExtractionItem(ext, dossierId, ext.category)
        );
    } catch {
      return [];
    }
  },

  async getRequirementsByDossier(dossierId: string): Promise<TenderRequirement[]> {
    return this.getRequirementsByDossierId(dossierId);
  },

  async getRequirementsByDossierId(dossierId: string): Promise<TenderRequirement[]> {
    if (!dossierId) return [];
    try {
      const [reqResponse, evResponse] = await Promise.all([
        apiClient.get('/tender_requirements', {
          params: { limit: 100 },
          skipGlobalErrorAlert: true,
        }),
        apiClient
          .get('/requirement_evidence', {
            params: { limit: 100 },
            skipGlobalErrorAlert: true,
          })
          .catch(() => ({ data: { results: [] } })),
      ]);

      const list =
        reqResponse.data?.results ||
        reqResponse.data?.data ||
        (Array.isArray(reqResponse.data) ? reqResponse.data : []);
      if (!Array.isArray(list)) return [];

      const allEvidences: RequirementEvidence[] =
        evResponse.data?.results ||
        evResponse.data?.data ||
        (Array.isArray(evResponse.data) ? evResponse.data : []);

      return list
        .filter((req: any) => req.dossierId === dossierId)
        .map((req: any) => {
          const reqId = String(req.id || req._id || '');
          const inlineEvidence = Array.isArray(req.evidence)
            ? req.evidence
            : Array.isArray(req.requirement_evidence)
              ? req.requirement_evidence
              : [];
          const matchedEvidence = Array.isArray(allEvidences)
            ? allEvidences.filter((ev: any) => ev.requirementId === reqId)
            : [];

          const mergedEvidence = [
            ...inlineEvidence,
            ...matchedEvidence.filter(
              (me) => !inlineEvidence.some((ie: any) => ie.id === me.id)
            ),
          ];

          return {
            id: reqId,
            dossierId: String(req.dossierId || dossierId),
            category: (req.category || 'tecnico') as TenderRequirement['category'],
            title:
              req.title ||
              req.name ||
              req.requirementKey ||
              'Requisito de Licitación',
            description: req.description || req.detail || '',
            isMandatory:
              req.isMandatory !== undefined ? Boolean(req.isMandatory) : true,
            dueDate: req.dueDate ? String(req.dueDate).split('T')[0] : '',
            ownerId: req.ownerId || req.assignedTo || '',
            status: req.status || 'pendiente',
            pendingId: req.pendingId,
            evidence: mergedEvidence,
          };
        });
    } catch {
      return [];
    }
  },

  async getDossierAnalysis(dossierId: string): Promise<DossierAnalysisConsolidado> {
    const response = await apiClient.get(`/tender_analysis/dossier/${dossierId}`, {
      skipGlobalErrorAlert: true,
    });
    const raw =
      response.data?.results?.[0] || response.data?.data || response.data || {};
    const resolvedDossierId = String(raw?.dossierId || dossierId);

    const parsedFromAnalysis: TenderExtraction[] = [];

    // Estructura real de GET /tender_analysis/dossier/:dossierId:
    // { dossierId, totalExtractions, analysis: { identificacion: {...}, calendario: {...}, economico: {...}, riesgos: [...], otros: [...] } }
    if (raw?.analysis && typeof raw.analysis === 'object') {
      for (const [catKey, entry] of Object.entries(raw.analysis)) {
        if (!entry) continue;
        const items = Array.isArray(entry) ? entry : [entry];
        for (const item of items) {
          if (
            item &&
            typeof item === 'object' &&
            (item.id ||
              item.fieldKey ||
              item.value !== undefined ||
              item.valueJson !== undefined)
          ) {
            parsedFromAnalysis.push(
              this.normalizeExtractionItem(item, resolvedDossierId, catKey)
            );
          }
        }
      }
    }

    if (parsedFromAnalysis.length === 0) {
      const rawExtractions =
        raw?.extractions ||
        raw?.tenderExtractions ||
        raw?.tender_extractions ||
        [];
      if (Array.isArray(rawExtractions)) {
        for (const ext of rawExtractions) {
          parsedFromAnalysis.push(
            this.normalizeExtractionItem(ext, resolvedDossierId, ext?.category)
          );
        }
      }
    }

    return {
      dossierId: resolvedDossierId,
      totalExtractions: Number(
        raw?.totalExtractions ?? parsedFromAnalysis.length
      ),
      analysis: raw?.analysis,
      dossier: raw?.dossier || raw?.tenderDossier || raw?.tender_dossier || null,
      documents:
        raw?.documents ||
        raw?.tenderDocuments ||
        raw?.tender_documents ||
        [],
      activeJob:
        raw?.activeJob ||
        raw?.processingJob ||
        raw?.processing_job ||
        null,
      extractions: parsedFromAnalysis,
      requirements:
        raw?.requirements ||
        raw?.tenderRequirements ||
        raw?.tender_requirements ||
        [],
      questions:
        raw?.questions ||
        raw?.tenderQuestions ||
        raw?.tender_questions ||
        [],
    };
  },

  async updateExtraction(
    extractionId: string,
    payload: { userEditedValue?: any; status: ExtractionStatus }
  ): Promise<TenderExtraction> {
    const response = await apiClient.put(`/tender_extractions/${extractionId}`, payload);
    const updated =
      response.data?.results?.[0] || response.data?.data || response.data;
    return updated;
  },

  // 4. Matriz de Requisitos, Evidencias y Sincronización CRM
  async createRequirement(payload: CreateTenderRequirementDto): Promise<TenderRequirement> {
    const cleanBody = {
      dossierId: payload.dossierId,
      category: payload.category || 'tecnico',
      title: payload.title,
      description: payload.description || payload.title,
      isMandatory: payload.isMandatory !== undefined ? Boolean(payload.isMandatory) : true,
      dueDate:
        payload.dueDate ||
        new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      ownerId: payload.ownerId,
      status: payload.status || 'pendiente',
    };
    const response = await apiClient.post('/tender_requirements', cleanBody);
    const created =
      response.data?.results?.[0] || response.data?.data || response.data;
    if (created?.id) {
      return {
        ...cleanBody,
        ...(typeof created === 'object' ? created : {}),
        id: String(created.id),
      };
    }
    const list = await this.getRequirementsByDossierId(payload.dossierId);
    return list.find((r) => r.title === payload.title) || list[0] || created;
  },

  async updateRequirementStatus(
    requirementId: string,
    status: RequirementStatus
  ): Promise<TenderRequirement> {
    const response = await apiClient.put(`/tender_requirements/${requirementId}`, {
      status,
    });
    return response.data?.results?.[0] || response.data?.data || response.data;
  },

  async deleteRequirement(requirementId: string): Promise<any> {
    const response = await apiClient.delete(`/tender_requirements/${requirementId}`);
    return response.data?.results?.[0] || response.data?.data || response.data;
  },

  async addRequirementEvidence(
    payload: CreateRequirementEvidenceDto
  ): Promise<RequirementEvidence> {
    const cleanBody = {
      requirementId: String(payload.requirementId).trim(),
      documentId: String(payload.documentId).trim(),
      pageNumber: Number(payload.pageNumber || 1),
      quoteText: String(payload.quoteText || '').trim(),
      notes: payload.notes ? String(payload.notes).trim() : '',
    };
    const response = await apiClient.post('/requirement_evidence', cleanBody);
    const created =
      response.data?.results?.[0] || response.data?.data || response.data;
    return {
      ...cleanBody,
      ...(created && typeof created === 'object' ? created : {}),
      id: String(created?.id || created?._id || `ev-${Date.now()}`),
    };
  },

  async createRequirementPending(
    requirementId: string,
    payload: CreatePendingFromRequirementDto
  ): Promise<CreatePendingFromRequirementResponse> {
    const response = await apiClient.post(
      `/tender_requirements/${requirementId}/create-pending`,
      payload
    );
    return response.data?.results?.[0] || response.data?.data || response.data;
  },

  // 5. Asistente RAG y Citas
  normalizeQuestionCitation(cit: any, questionId?: string, idx = 0): QuestionCitation {
    const pageNum = Number(cit?.page ?? cit?.pageNumber ?? 1);
    const scoreNum = Number(cit?.score ?? cit?.relevanceScore ?? 0);
    return {
      id: String(cit?.id || `${questionId || 'q'}-cit-${idx}`),
      questionId: String(cit?.questionId || questionId || ''),
      documentId: String(cit?.documentId || ''),
      filename: cit?.filename || cit?.documentFilename || '',
      page: pageNum,
      pageNumber: pageNum,
      chunkId: cit?.chunkId || '',
      excerpt: String(cit?.excerpt || cit?.quoteText || ''),
      score: scoreNum,
      relevanceScore: scoreNum,
    };
  },

  async getQuestionsByDossierId(dossierId: string): Promise<TenderQuestion[]> {
    try {
      const [qRes, citRes] = await Promise.all([
        apiClient.get('/tender_questions', {
          params: { limit: 50 },
          skipGlobalErrorAlert: true,
        }),
        apiClient
          .get('/question_citations', {
            params: { limit: 100 },
            skipGlobalErrorAlert: true,
          })
          .catch(() => ({ data: { results: [] } })),
      ]);

      const list =
        qRes.data?.results ||
        qRes.data?.data ||
        (Array.isArray(qRes.data) ? qRes.data : []);
      if (!Array.isArray(list)) return [];

      const allCitations =
        citRes.data?.results ||
        citRes.data?.data ||
        (Array.isArray(citRes.data) ? citRes.data : []);

      return list
        .filter((q: any) => q.dossierId === dossierId)
        .map((q: any) => {
          const qId = String(q.id || q.questionId || '');
          const inlineCitations = Array.isArray(q.citations) ? q.citations : [];
          const matchedCitations = Array.isArray(allCitations)
            ? allCitations.filter((c: any) => c.questionId === qId)
            : [];
          const mergedCitations = (
            inlineCitations.length > 0 ? inlineCitations : matchedCitations
          ).map((c: any, idx: number) =>
            this.normalizeQuestionCitation(c, qId, idx)
          );

          return {
            id: qId,
            questionId: qId,
            dossierId: String(q.dossierId || dossierId),
            question: String(q.question || q.query || ''),
            answer: String(q.answer || ''),
            confidence: q.confidence,
            warnings: Array.isArray(q.warnings) ? q.warnings : [],
            askedBy: q.askedBy || q.createdById || '',
            createdAt: q.createdAt || '',
            citations: mergedCitations,
          };
        });
    } catch {
      return [];
    }
  },

  async askDossierQuestion(dossierId: string, question: string): Promise<TenderQuestion> {
    const response = await apiClient.post(`/tender_analysis/question/${dossierId}`, {
      question,
    });
    const raw =
      response.data?.results?.[0] || response.data?.data || response.data || {};
    const qId = String(raw?.questionId || raw?.id || `q-${Date.now()}`);
    const rawCitations = Array.isArray(raw?.citations) ? raw.citations : [];

    return {
      id: qId,
      questionId: qId,
      dossierId,
      question: String(raw?.question || question),
      answer: String(raw?.answer || ''),
      confidence: raw?.confidence,
      warnings: Array.isArray(raw?.warnings) ? raw.warnings : [],
      createdAt: raw?.createdAt || new Date().toISOString(),
      citations: rawCitations.map((c: any, idx: number) =>
        this.normalizeQuestionCitation(c, qId, idx)
      ),
    };
  },

  // 6. Auditoría Forense (tender_audit_log)
  async getAuditLogs(dossierId: string, limit = 10): Promise<TenderAuditLog[]> {
    const response = await apiClient.get(
      `/tender_audit_log?dossierId=${encodeURIComponent(dossierId)}&limit=${limit}`,
      { skipGlobalErrorAlert: true }
    );
    const list =
      response.data?.results ||
      response.data?.data ||
      (Array.isArray(response.data) ? response.data : []);
    return Array.isArray(list) ? list : [];
  },

  async logTenderAudit(payload: CreateTenderAuditLogDto): Promise<TenderAuditLog> {
    const response = await apiClient.post('/tender_audit_log', payload);
    return response.data?.results?.[0] || response.data?.data || response.data;
  },
};
