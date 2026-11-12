import { useState, useEffect, useCallback, useRef } from 'react';
import {
  TenderDossier,
  TenderDocument,
  ProcessingJob,
  TenderExtraction,
  ExtractionStatus,
  TenderRequirement,
  RequirementStatus,
  CreateTenderRequirementDto,
  CreateRequirementEvidenceDto,
  CreatePendingFromRequirementDto,
  TenderQuestion,
  TenderAuditLog,
} from '../types/licitacion.types';
import {
  licitacionesService,
  calculateFileChecksum,
} from '../services/licitacionesService';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/lib/alerts';

interface UseExpedienteInteligenteParams {
  projectId: string;
  initialTitle?: string;
  initialTenderCode?: string;
  initialIssuingEntity?: string;
}

/**
 * Extrae el ID real del usuario autenticado desde el estado de sesión o el payload del JWT
 */
function resolveAuthenticatedUserId(user: any, tokenSession?: string | null): string {
  if (user?.id) return String(user.id);
  if (user?._id) return String(user._id);
  if (user?.user?.id) return String(user.user.id);

  if (tokenSession && typeof window !== 'undefined') {
    try {
      const parts = tokenSession.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const jwtId =
          payload?.id || payload?._id || payload?.userId || payload?.sub;
        if (jwtId) return String(jwtId);
      }
    } catch {
      // Ignorar si el token no es decodificable
    }
  }

  return user?.username || user?.email || '';
}

export const useExpedienteInteligente = ({
  projectId,
}: UseExpedienteInteligenteParams) => {
  const { user, tokenSession } = useAuthStore();
  const actorId = resolveAuthenticatedUserId(user, tokenSession);
  const actorName =
    [user?.name, user?.lastname].filter(Boolean).join(' ').trim() ||
    user?.fullname ||
    user?.username ||
    user?.email ||
    actorId;

  const [dossier, setDossier] = useState<TenderDossier | null>(null);
  const [documents, setDocuments] = useState<TenderDocument[]>([]);
  const [activeJob, setActiveJob] = useState<ProcessingJob | null>(null);
  const [extractions, setExtractions] = useState<TenderExtraction[]>([]);
  const [requirements, setRequirements] = useState<TenderRequirement[]>([]);
  const [questions, setQuestions] = useState<TenderQuestion[]>([]);
  const [auditLogs, setAuditLogs] = useState<TenderAuditLog[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isAskingRag, setIsAskingRag] = useState<boolean>(false);

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dossierId = dossier?.id || '';

  const clearJobPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const refreshAnalysis = useCallback(
    async (explicitDossierId?: string) => {
      if (!projectId) return;
      setIsLoading(true);
      try {
        let currentDossier = dossier;
        if (!currentDossier?.id && !explicitDossierId) {
          currentDossier = await licitacionesService.getDossierByProjectId(projectId);
          if (currentDossier?.id) {
            setDossier(currentDossier);
          }
        }

        const targetDossierId = explicitDossierId || currentDossier?.id || projectId;

        const [
          consolidated,
          directDocs,
          directExtractions,
          directRequirements,
          directQuestions,
          logs,
        ] = await Promise.all([
          licitacionesService.getDossierAnalysis(targetDossierId).catch(() => null),
          licitacionesService.getDocumentsByDossierId(targetDossierId).catch(() => []),
          licitacionesService
            .getExtractionsByDossierId(targetDossierId)
            .catch(() => []),
          licitacionesService
            .getRequirementsByDossierId(targetDossierId)
            .catch(() => []),
          licitacionesService
            .getQuestionsByDossierId(targetDossierId)
            .catch(() => []),
          licitacionesService.getAuditLogs(targetDossierId, 20).catch(() => []),
        ]);

        if (consolidated?.dossier?.id) {
          setDossier(consolidated.dossier);
        }

        const consolidatedDocs = Array.isArray(consolidated?.documents)
          ? consolidated.documents
          : [];
        setDocuments(consolidatedDocs.length > 0 ? consolidatedDocs : directDocs);

        const consolidatedExtractions = Array.isArray(consolidated?.extractions)
          ? consolidated.extractions
          : [];
        const mergedExtractions =
          consolidatedExtractions.length > 0
            ? [
                ...consolidatedExtractions,
                ...directExtractions.filter(
                  (de) => !consolidatedExtractions.some((ce) => ce.id === de.id)
                ),
              ]
            : directExtractions;
        setExtractions(mergedExtractions);

        const consolidatedRequirements = Array.isArray(consolidated?.requirements)
          ? consolidated.requirements
          : [];
        const mergedRequirements =
          directRequirements.length > 0
            ? [
                ...directRequirements,
                ...consolidatedRequirements.filter(
                  (cr) => !directRequirements.some((dr) => dr.id === cr.id)
                ),
              ]
            : consolidatedRequirements;
        setRequirements(mergedRequirements);

        const consolidatedQuestions = Array.isArray(consolidated?.questions)
          ? consolidated.questions
          : [];
        setQuestions(
          directQuestions.length > 0 ? directQuestions : consolidatedQuestions
        );

        if (consolidated?.activeJob?.id) {
          setActiveJob(consolidated.activeJob);
        }

        setAuditLogs(Array.isArray(logs) ? logs : []);
      } catch {
        // Conservar estado previo si ocurre un error de red puntual
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, dossier]
  );

  useEffect(() => {
    setDossier(null);
    setDocuments([]);
    setExtractions([]);
    setRequirements([]);
    setQuestions([]);
    setAuditLogs([]);
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    refreshAnalysis();
    return () => clearJobPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Polling automático cada 3 segundos cuando el job está en 'queued' o 'in_progress'
  useEffect(() => {
    const currentJobId = activeJob?.id;
    const currentJobStatus = activeJob?.status;
    const currentJobDossierId = activeJob?.dossierId || dossier?.id || '';
    const currentJobDocId = activeJob?.documentId || '';

    if (
      !currentJobId ||
      (currentJobStatus !== 'queued' && currentJobStatus !== 'in_progress')
    ) {
      clearJobPolling();
      return;
    }

    clearJobPolling();
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const updatedJob = await licitacionesService.getProcessingJob(
          currentJobId,
          currentJobDossierId,
          currentJobDocId
        );

        setActiveJob((prev) => (prev ? { ...prev, ...updatedJob } : updatedJob));

        if (
          updatedJob.status === 'completed' ||
          Number(updatedJob.progressPercentage) >= 100
        ) {
          clearJobPolling();
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === currentJobDocId
                ? { ...d, processingStatus: 'analizado', status: 'analizado' }
                : d
            )
          );
          toast.success('Análisis de pliego completado (100%)', {
            description:
              updatedJob.currentStep ||
              'Extracciones IA, matriz de requisitos y embeddings RAG actualizados.',
          });
          await refreshAnalysis(updatedJob.dossierId || currentJobDossierId);
          setActiveJob(null);
        } else if (updatedJob.status === 'failed') {
          clearJobPolling();
          toast.error('Error en el procesamiento del pliego', {
            description:
              updatedJob.errorLog ||
              'El worker reportó una falla durante la extracción.',
          });
          setActiveJob(null);
        }
      } catch {
        // Continuar el polling en el siguiente ciclo de 3s si hubo un fallo de red transitorio
      }
    }, 3000);

    return () => clearJobPolling();
  }, [
    activeJob?.id,
    activeJob?.status,
    activeJob?.dossierId,
    activeJob?.documentId,
    dossier?.id,
    clearJobPolling,
    refreshAnalysis,
  ]);

  const initializeDossierInBackend = async (): Promise<TenderDossier> => {
    const existing = await licitacionesService.getDossierByProjectId(projectId);
    if (existing?.id) {
      setDossier(existing);
      return existing;
    }

    const created = await licitacionesService.createDossier({
      projectId,
      status: 'creado',
      currentVersion: 1,
      createdById: actorId,
    });
    setDossier(created);
    return created;
  };

  // 1. Subida de PDF con cálculo SHA-256 + registro + auditoría UPLOAD
  const uploadDocument = async (file: File) => {
    setIsUploading(true);
    try {
      let realDossierId = dossier?.id;
      if (!realDossierId) {
        const createdDossier = await initializeDossierInBackend();
        realDossierId = createdDossier.id;
      }

      const checksum = await calculateFileChecksum(file);

      const doc = await licitacionesService.registerDocument({
        dossierId: realDossierId,
        filename: file.name,
        fileType: 'pliego',
        checksum,
        version: 1,
        processingStatus: 'cargado',
        errorMessage: '',
      });

      setDocuments((prev) => [doc, ...prev]);

      const log = await licitacionesService.logTenderAudit({
        dossierId: realDossierId,
        actorId,
        action: 'UPLOAD',
        entityName: 'tender_documents',
        entityId: doc.id,
        beforeJson: null,
        afterJson: {
          dossierId: realDossierId,
          fileId: doc.fileId,
          filename: doc.filename,
          fileType: doc.fileType,
          checksum: doc.checksum,
          version: doc.version,
          processingStatus: doc.processingStatus,
        },
      });
      setAuditLogs((prev) => [log, ...prev]);

      toast.success('Pliego registrado con integridad SHA-256', {
        description: `${doc.filename} (${checksum.slice(0, 12)}...)`,
      });
      return doc;
    } finally {
      setIsUploading(false);
    }
  };

  // Eliminar documento
  const removeDocument = async (documentId: string) => {
    await licitacionesService.deleteDocument(documentId);
    setDocuments((prev) => prev.filter((d) => d.id !== documentId));
    toast.info('Documento eliminado del expediente');
  };

  // Disparar procesamiento asíncrono IA
  const triggerDocumentAnalysis = async (documentId: string) => {
    const targetDoc = documents.find((d) => d.id === documentId);
    const targetDossierId = targetDoc?.dossierId || dossier?.id || '';

    let job: ProcessingJob;
    try {
      job = await licitacionesService.processDocument(documentId, targetDossierId);
    } catch {
      job = await licitacionesService.createProcessingJob({
        dossierId: targetDossierId,
        documentId,
        jobType: 'ocr_extraction_rag',
        status: 'queued',
        progressPercentage: 0,
        currentStep: '',
        errorLog: '',
        attempts: 0,
      });
    }

    setActiveJob(job);
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === documentId
          ? {
              ...d,
              processingStatus:
                job?.status === 'completed' ? 'analizado' : 'procesando',
              status: job?.status === 'completed' ? 'analizado' : 'procesando',
            }
          : d
      )
    );
    setDossier((prev) => (prev ? { ...prev, status: 'analizando' } : prev));

    if (job?.status === 'completed') {
      toast.success('Análisis de pliego completado (100%)', {
        description:
          job.currentStep ||
          'Extracciones IA, matriz de requisitos y embeddings RAG actualizados.',
      });
      await refreshAnalysis();
      setActiveJob(null);
    } else {
      toast.info('Job asíncrono iniciado (OCR + IA + RAG)', {
        description: `Monitoreando progreso del job`,
      });
    }
    return job;
  };

  // 2. Confirmar o Editar extracción IA + auditoría CONFIRM_EXTRACTION / EDIT_FIELD
  const confirmExtraction = async (extraction: TenderExtraction) => {
    const targetDossierId = dossier?.id || extraction.dossierId;
    const beforeState = {
      status: extraction.status,
      valueJson: extraction.valueJson,
      userEditedValue: extraction.userEditedValue ?? null,
    };

    const updated = await licitacionesService.updateExtraction(extraction.id, {
      status: 'confirmado',
      userEditedValue: extraction.userEditedValue,
    });

    setExtractions((prev) =>
      prev.map((item) =>
        item.id === extraction.id
          ? {
              ...item,
              ...(updated && typeof updated === 'object' ? updated : {}),
              status: 'confirmado',
              userEditedValue: extraction.userEditedValue ?? item.userEditedValue,
            }
          : item
      )
    );

    const log = await licitacionesService.logTenderAudit({
      dossierId: targetDossierId,
      actorId,
      action: 'CONFIRM_EXTRACTION',
      entityName: 'tender_extractions',
      entityId: extraction.id,
      beforeJson: beforeState,
      afterJson: {
        status: 'confirmado',
        fieldKey: extraction.fieldKey,
        confidence: extraction.confidence,
      },
    });
    setAuditLogs((prev) => [log, ...prev]);

    toast.success(`Campo "${extraction.fieldKey}" confirmado`);
    return updated;
  };

  const editExtractionValue = async (
    extraction: TenderExtraction,
    newEditedValue: any,
    newStatus: ExtractionStatus = 'confirmado'
  ) => {
    const targetDossierId = dossier?.id || extraction.dossierId;
    const beforeState = {
      status: extraction.status,
      valueJson: extraction.valueJson,
      userEditedValue: extraction.userEditedValue ?? null,
    };

    const updated = await licitacionesService.updateExtraction(extraction.id, {
      userEditedValue: newEditedValue,
      status: newStatus,
    });

    setExtractions((prev) =>
      prev.map((item) =>
        item.id === extraction.id
          ? {
              ...item,
              ...(updated && typeof updated === 'object' ? updated : {}),
              status: newStatus,
              isUserEdited: true,
              userEditedValue: newEditedValue,
              value: newEditedValue,
              valueJson: newEditedValue,
            }
          : item
      )
    );

    const log = await licitacionesService.logTenderAudit({
      dossierId: targetDossierId,
      actorId,
      action: 'EDIT_FIELD',
      entityName: 'tender_extractions',
      entityId: extraction.id,
      beforeJson: beforeState,
      afterJson: {
        status: newStatus,
        fieldKey: extraction.fieldKey,
        userEditedValue: newEditedValue,
      },
    });
    setAuditLogs((prev) => [log, ...prev]);

    toast.success(`Extracción "${extraction.fieldKey}" actualizada manualmente`);
    return updated;
  };

  // Helper para obtener el documentId del pliego activo en el expediente
  const resolveActiveDocumentId = async (
    targetDossierId: string,
    preferredDocId?: string,
    preferredFilename?: string
  ): Promise<string> => {
    if (preferredDocId && preferredDocId !== 'consolidated') {
      return preferredDocId;
    }
    if (preferredFilename) {
      const matchedByName = documents.find(
        (d) => d.filename === preferredFilename
      );
      if (matchedByName?.id) return matchedByName.id;
    }
    if (documents[0]?.id) {
      return documents[0].id;
    }
    const fetchedDocs = await licitacionesService
      .getDocumentsByDossierId(targetDossierId)
      .catch(() => []);
    if (fetchedDocs.length > 0) {
      setDocuments(fetchedDocs);
      if (preferredFilename) {
        const matched = fetchedDocs.find((d) => d.filename === preferredFilename);
        if (matched?.id) return matched.id;
      }
      return fetchedDocs[0].id;
    }
    return '';
  };

  // 3. Matriz de Requisitos y Sincronización CRM + auditoría GENERATE_TASK / EDIT_FIELD
  const addRequirement = async (
    dto: Omit<CreateTenderRequirementDto, 'dossierId'>,
    initialEvidence?: Omit<CreateRequirementEvidenceDto, 'requirementId'>
  ) => {
    let realDossierId = dossier?.id;
    if (!realDossierId) {
      const createdDossier = await initializeDossierInBackend();
      realDossierId = createdDossier.id;
    }

    const created = await licitacionesService.createRequirement({
      ...dto,
      ownerId: dto.ownerId || actorId,
      dossierId: realDossierId,
    });

    let attachedEvidences = created.evidence || [];
    if (initialEvidence && initialEvidence.quoteText.trim()) {
      const resolvedDocId = await resolveActiveDocumentId(
        realDossierId,
        initialEvidence.documentId
      );
      if (resolvedDocId) {
        const ev = await licitacionesService.addRequirementEvidence({
          requirementId: created.id,
          documentId: resolvedDocId,
          pageNumber: Number(initialEvidence.pageNumber || 1),
          quoteText: initialEvidence.quoteText.trim(),
          notes: initialEvidence.notes?.trim() || '',
        });
        attachedEvidences = [...attachedEvidences, ev];
      }
    }

    const enrichedRequirement: TenderRequirement = {
      ...created,
      evidence: attachedEvidences,
    };

    setRequirements((prev) => [enrichedRequirement, ...prev]);
    toast.success('Requisito agregado a la matriz de cumplimiento');
    return enrichedRequirement;
  };

  // Crear Requisito con Evidencia directamente desde una Extracción IA (Tab 2 -> Tab 3)
  const createRequirementFromExtraction = async (
    extraction: TenderExtraction,
    options?: {
      subKey?: string;
      subValue?: any;
      dueDate?: string;
    }
  ): Promise<TenderRequirement> => {
    let realDossierId = dossier?.id || extraction.dossierId;
    if (!realDossierId) {
      const createdDossier = await initializeDossierInBackend();
      realDossierId = createdDossier.id;
    }

    const resolvedDocId = await resolveActiveDocumentId(
      realDossierId,
      extraction.documentId,
      extraction.documentFilename
    );

    const categoryMap: Record<string, TenderRequirement['category']> = {
      economico: 'financiero',
      identificacion: 'legal',
      calendario: 'administrativo',
      riesgos: 'tecnico',
      otros: 'tecnico',
    };
    const reqCategory = categoryMap[extraction.category] || 'tecnico';

    const displayVal =
      extraction.userEditedValue !== undefined &&
      extraction.userEditedValue !== null
        ? extraction.userEditedValue
        : extraction.value !== undefined
          ? extraction.value
          : extraction.valueJson;

    const formatVal = (val: any): string => {
      if (val === null || val === undefined) return 'No especificado';
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        return String(val);
      }
      if (Array.isArray(val)) {
        return val.map((item) => formatVal(item)).join(', ');
      }
      if (typeof val === 'object') {
        return Object.entries(val)
          .filter(([k, v]) => k !== 'source_page' && v !== null && v !== undefined)
          .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${formatVal(v)}`)
          .join(' | ');
      }
      return String(val);
    };

    const humanFieldKey = extraction.fieldKey
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    let title = `Validar ${humanFieldKey}`;
    let quoteText = formatVal(displayVal);
    let description = `Requisito derivado de extracción IA (${humanFieldKey}): ${quoteText}`;

    if (options?.subKey) {
      const humanSubKey = options.subKey
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      const subValStr = formatVal(options.subValue);
      title = `${humanFieldKey} — ${humanSubKey}`;
      quoteText = `${humanSubKey}: ${subValStr}`;
      description = `Requisito derivado de extracción IA (${humanFieldKey} • ${humanSubKey}): ${subValStr}`;
    }

    const pageNumber = Number(
      extraction.sourcePage ||
        (typeof displayVal === 'object' && displayVal?.source_page) ||
        1
    );

    const createdReq = await licitacionesService.createRequirement({
      dossierId: realDossierId,
      category: reqCategory,
      title,
      description,
      isMandatory: true,
      dueDate:
        options?.dueDate ||
        new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      ownerId: actorId,
      status: 'pendiente',
    });

    let attachedEvidences = createdReq.evidence || [];
    if (resolvedDocId) {
      const createdEv = await licitacionesService.addRequirementEvidence({
        requirementId: createdReq.id,
        documentId: resolvedDocId,
        pageNumber,
        quoteText: quoteText || title,
        notes: 'Generado a partir de extracción IA',
      });
      attachedEvidences = [...attachedEvidences, createdEv];
    }

    const enrichedRequirement: TenderRequirement = {
      ...createdReq,
      evidence: attachedEvidences,
    };

    setRequirements((prev) => [enrichedRequirement, ...prev]);

    toast.success('Requisito con evidencia enviado a la Matriz', {
      description: `${title} • Pág. ${pageNumber}`,
    });

    return enrichedRequirement;
  };

  const updateRequirementStatus = async (
    requirement: TenderRequirement,
    newStatus: RequirementStatus
  ) => {
    const targetDossierId = dossier?.id || requirement.dossierId;
    const beforeState = {
      status: requirement.status,
      title: requirement.title,
    };

    const updated = await licitacionesService.updateRequirementStatus(
      requirement.id,
      newStatus
    );

    setRequirements((prev) =>
      prev.map((r) =>
        r.id === requirement.id
          ? {
              ...r,
              ...(updated && typeof updated === 'object' ? updated : {}),
              status: newStatus,
              evidence: r.evidence,
            }
          : r
      )
    );

    const log = await licitacionesService.logTenderAudit({
      dossierId: targetDossierId,
      actorId,
      action: 'EDIT_FIELD',
      entityName: 'tender_requirements',
      entityId: requirement.id,
      beforeJson: beforeState,
      afterJson: {
        status: newStatus,
        title: requirement.title,
      },
    });
    setAuditLogs((prev) => [log, ...prev]);

    toast.success(`Semáforo del requisito actualizado a "${newStatus}"`);
    return updated;
  };

  const removeRequirement = async (requirementId: string) => {
    await licitacionesService.deleteRequirement(requirementId);
    setRequirements((prev) => prev.filter((r) => r.id !== requirementId));
    toast.info('Requisito eliminado de la matriz');
  };

  const attachEvidence = async (dto: CreateRequirementEvidenceDto) => {
    const targetDossierId = dossier?.id || '';
    const resolvedDocId = await resolveActiveDocumentId(
      targetDossierId,
      dto.documentId
    );
    const evidence = await licitacionesService.addRequirementEvidence({
      ...dto,
      documentId: resolvedDocId || dto.documentId,
    });
    setRequirements((prev) =>
      prev.map((req) =>
        req.id === dto.requirementId
          ? { ...req, evidence: [...(req.evidence || []), evidence] }
          : req
      )
    );
    toast.success('Evidencia documental vinculada al requisito');
    return evidence;
  };

  const createPendingInCrm = async (
    requirement: TenderRequirement,
    dto: CreatePendingFromRequirementDto
  ) => {
    const targetDossierId = dossier?.id || requirement.dossierId;
    const beforeState = {
      status: requirement.status,
      ownerId: requirement.ownerId,
      dueDate: requirement.dueDate,
    };

    const result = await licitacionesService.createRequirementPending(
      requirement.id,
      dto
    );

    setRequirements((prev) =>
      prev.map((r) =>
        r.id === requirement.id
          ? {
              ...r,
              status: 'en_proceso',
              ownerId: dto.ownerId,
              dueDate: dto.dueDate,
              pendingId: result.pendingId,
            }
          : r
      )
    );

    const log = await licitacionesService.logTenderAudit({
      dossierId: targetDossierId,
      actorId,
      action: 'GENERATE_TASK',
      entityName: 'tender_requirements',
      entityId: requirement.id,
      beforeJson: beforeState,
      afterJson: {
        status: 'en_proceso',
        pendingId: result.pendingId,
        ownerId: dto.ownerId,
        dueDate: dto.dueDate,
        notes: dto.notes,
      },
    });
    setAuditLogs((prev) => [log, ...prev]);

    toast.success('Pendiente delegado a Limenka360 CRM', {
      description: `Folio CRM: ${result.pendingId} asignado a ${dto.ownerId}`,
    });

    return result;
  };

  // 4. Asistente de Consultas (RAG)
  const askQuestion = async (questionText: string) => {
    if (!questionText.trim()) return null;
    setIsAskingRag(true);
    try {
      let realDossierId = dossier?.id;
      if (!realDossierId) {
        const createdDossier = await initializeDossierInBackend();
        realDossierId = createdDossier.id;
      }

      const response = await licitacionesService.askDossierQuestion(
        realDossierId,
        questionText.trim()
      );
      setQuestions((prev) => [response, ...prev]);
      return response;
    } finally {
      setIsAskingRag(false);
    }
  };

  // 5. Eliminar expediente completo
  const removeDossier = async () => {
    if (!dossier?.id) return;
    await licitacionesService.deleteDossier(dossier.id);
    setDossier(null);
    toast.info('Expediente inteligente eliminado');
  };

  return {
    actorId,
    actorName,
    dossierId,
    dossier,
    documents,
    activeJob,
    extractions,
    requirements,
    questions,
    auditLogs,
    isLoading,
    isUploading,
    isAskingRag,
    refreshAnalysis,
    initializeDossierInBackend,
    uploadDocument,
    removeDocument,
    triggerDocumentAnalysis,
    confirmExtraction,
    editExtractionValue,
    addRequirement,
    createRequirementFromExtraction,
    updateRequirementStatus,
    removeRequirement,
    attachEvidence,
    createPendingInCrm,
    askQuestion,
    removeDossier,
  };
};
