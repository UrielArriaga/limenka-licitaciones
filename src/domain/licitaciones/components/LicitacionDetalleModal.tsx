import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Calendar,
  DollarSign,
  Building,
  FileText,
  CheckCircle2,
  Shield,
  Upload,
  Cpu,
  Sparkles,
  Check,
  Edit3,
  Trash2,
  ClipboardCheck,
  MessageSquare,
  History,
  AlertTriangle,
  Plus,
  Send,
  BookOpen,
  Hash,
  UserCheck,
  RefreshCw,
  Quote,
} from 'lucide-react';
import {
  Licitacion,
  ExtractionCategory,
  TenderExtraction,
  TenderRequirement,
  RequirementCategory,
  RequirementStatus,
  QuestionCitation,
} from '../types/licitacion.types';
import { StatusBadge } from './StatusBadge';
import { useExpedienteInteligente } from '../hooks/useExpedienteInteligente';

interface LicitacionDetalleModalProps {
  licitacion: Licitacion | null;
  onClose: () => void;
  onPendingCreated?: () => void;
}

type ExpedienteTab =
  | 'documentos'
  | 'extracciones'
  | 'requisitos'
  | 'rag'
  | 'auditoria';

const EXTRACTION_CATEGORY_META: Record<
  ExtractionCategory,
  { label: string; badgeClass: string }
> = {
  identificacion: {
    label: 'Identificación de Convocatoria',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  calendario: {
    label: 'Calendario de Eventos Críticos',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  economico: {
    label: 'Condiciones Económicas y Garantías',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  riesgos: {
    label: 'Riesgos, Penas y Deductivas',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  otros: {
    label: 'Otros Hallazgos Documentales',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

function formatExtractionFieldValue(val: any): string {
  if (val === null || val === undefined || val === '') {
    return 'No especificado';
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return 'Sin registros';
    return val
      .map((item) =>
        typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item)
      )
      .join(', ');
  }
  if (typeof val === 'object') {
    return Object.entries(val)
      .filter(([k]) => k !== 'source_page')
      .map(([k, v]) => `${k}: ${v ?? 'No especificado'}`)
      .join(' • ');
  }
  return String(val);
}

export const LicitacionDetalleModal: React.FC<LicitacionDetalleModalProps> = ({
  licitacion,
  onClose,
  onPendingCreated,
}) => {
  const [activeTab, setActiveTab] = useState<ExpedienteTab>('documentos');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estado de edición manual de extracciones IA (formulario amigable por campo)
  const [editingExtractionId, setEditingExtractionId] = useState<string | null>(null);
  const [editedFieldsMap, setEditedFieldsMap] = useState<Record<string, string>>({});
  const [editedTextValue, setEditedTextValue] = useState<string>('');

  // Estado para modal de "Crear Pendiente en CRM"
  const [pendingModalReq, setPendingModalReq] = useState<TenderRequirement | null>(null);
  const [pendingOwner, setPendingOwner] = useState<string>('');
  const [pendingDueDate, setPendingDueDate] = useState<string>('');
  const [pendingNotes, setPendingNotes] = useState<string>('');
  const [isSubmittingPending, setIsSubmittingPending] = useState<boolean>(false);

  // Estado para visor de evidencia seleccionada y modal de anexar evidencia
  const [selectedRequirementForEvidence, setSelectedRequirementForEvidence] =
    useState<TenderRequirement | null>(null);
  const [evidenceModalReq, setEvidenceModalReq] = useState<TenderRequirement | null>(
    null
  );
  const [evDocumentId, setEvDocumentId] = useState<string>('');
  const [evPageNumber, setEvPageNumber] = useState<number>(1);
  const [evQuoteText, setEvQuoteText] = useState<string>('');
  const [evNotes, setEvNotes] = useState<string>('');
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState<boolean>(false);

  // Estado para formulario rápido de nuevo requisito
  const [showNewReqForm, setShowNewReqForm] = useState<boolean>(false);
  const [newReqTitle, setNewReqTitle] = useState<string>('');
  const [newReqDesc, setNewReqDesc] = useState<string>('');
  const [newReqCategory, setNewReqCategory] = useState<RequirementCategory>('tecnico');
  const [newReqIsMandatory, setNewReqIsMandatory] = useState<boolean>(true);
  const [newReqDueDate, setNewReqDueDate] = useState<string>('');
  const [newReqOwner, setNewReqOwner] = useState<string>('');
  const [newReqEvDocId, setNewReqEvDocId] = useState<string>('');
  const [newReqEvPage, setNewReqEvPage] = useState<string>('');
  const [newReqEvQuote, setNewReqEvQuote] = useState<string>('');
  const [newReqEvNotes, setNewReqEvNotes] = useState<string>('');

  // Estado para el Asistente RAG
  const [ragInput, setRagInput] = useState<string>('');
  const [selectedCitation, setSelectedCitation] = useState<QuestionCitation | null>(null);

  // Estado para confirmación de borrado
  const [confirmDeleteDocId, setConfirmDeleteDocId] = useState<string | null>(null);
  const [confirmDeleteReqId, setConfirmDeleteReqId] = useState<string | null>(null);
  const [confirmDeleteDossier, setConfirmDeleteDossier] = useState<boolean>(false);
  const [sendingExtractionKey, setSendingExtractionKey] = useState<string | null>(
    null
  );

  const {
    actorId,
    actorName,
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
  } = useExpedienteInteligente({
    projectId: licitacion?.id || '',
    initialTitle: licitacion?.titulo,
    initialTenderCode: licitacion?.codigo,
    initialIssuingEntity: licitacion?.entidad,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pendingModalReq && !evidenceModalReq) onClose();
    };
    if (licitacion) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [licitacion, onClose, pendingModalReq, evidenceModalReq]);

  if (!licitacion) return null;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
  };

  const formatDateYMD = (dateValue?: string) => {
    if (!dateValue) return '—';
    const raw = String(dateValue).trim();
    const datePart = raw.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return datePart.replace(/-/g, '/');
    }
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      return `${yyyy}/${mm}/${dd}`;
    }
    return raw;
  };

  const AUDIT_FIELD_LABELS: Record<string, string> = {
    status: 'Estatus',
    processingStatus: 'Procesamiento',
    filename: 'Archivo',
    fileType: 'Tipo',
    version: 'Versión',
    checksum: 'SHA-256',
    fieldKey: 'Campo',
    confidence: 'Confianza IA',
    title: 'Título',
    dueDate: 'Fecha límite',
    ownerId: 'Responsable',
    pendingId: 'Folio CRM',
    notes: 'Notas',
    valueJson: 'Datos',
    userEditedValue: 'Datos editados',
  };

  const formatAuditValue = (key: string, val: any): string => {
    if (val === null || val === undefined || val === '') return 'Sin especificar';
    if (key === 'ownerId') {
      return val === actorId || String(val).length >= 20 ? actorName : String(val);
    }
    if (key === 'dueDate') {
      return formatDateYMD(String(val));
    }
    if (key === 'checksum') {
      return `${String(val).slice(0, 12)}...`;
    }
    if (key === 'confidence') {
      const num = Number(val);
      if (!Number.isNaN(num)) {
        return `${num <= 1 ? Math.round(num * 100) : Math.round(num)}%`;
      }
    }
    if (typeof val === 'boolean') return val ? 'Sí' : 'No';
    return String(val).replace(/_/g, ' ');
  };

  const renderAuditStateCard = (
    data: Record<string, any> | null | undefined,
    variant: 'before' | 'after'
  ) => {
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-400 italic">
          Sin registro previo
        </span>
      );
    }

    const rows: Array<{ label: string; value: string }> = [];

    Object.entries(data).forEach(([key, rawVal]) => {
      if (key === 'dossierId' || key === 'fileId' || key === 'source_page') return;
      if (rawVal === null || rawVal === undefined) return;

      if (
        typeof rawVal === 'object' &&
        !Array.isArray(rawVal)
      ) {
        Object.entries(rawVal).forEach(([subKey, subVal]) => {
          if (subKey === 'source_page' || subVal === null || subVal === undefined) {
            return;
          }
          const cleanSubLabel = subKey
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
          rows.push({
            label: cleanSubLabel,
            value: formatAuditValue(subKey, subVal),
          });
        });
      } else {
        const label =
          AUDIT_FIELD_LABELS[key] ||
          key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        rows.push({
          label,
          value: formatAuditValue(key, rawVal),
        });
      }
    });

    if (rows.length === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-400 italic">
          Sin cambios registrados
        </span>
      );
    }

    const containerClass =
      variant === 'after'
        ? 'bg-emerald-50/50 border-emerald-200/80 text-slate-800'
        : 'bg-slate-50 border-slate-200/80 text-slate-700';

    return (
      <div
        className={`p-2.5 rounded-xl border space-y-1 max-w-xs ${containerClass}`}
      >
        {rows.map((row, idx) => (
          <div
            key={`${row.label}-${idx}`}
            className="flex items-baseline justify-between gap-3 text-[11px] border-b border-slate-200/40 pb-1 last:border-none last:pb-0"
          >
            <span className="text-slate-500 font-medium shrink-0">
              {row.label}:
            </span>
            <span className="font-semibold text-slate-900 text-right break-words">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDocument(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startEditingExtraction = (ext: TenderExtraction) => {
    setEditingExtractionId(ext.id);
    const currentVal =
      ext.userEditedValue !== undefined && ext.userEditedValue !== null
        ? ext.userEditedValue
        : ext.value !== undefined
          ? ext.value
          : ext.valueJson;

    if (
      typeof currentVal === 'object' &&
      currentVal !== null &&
      !Array.isArray(currentVal)
    ) {
      const nextFields: Record<string, string> = {};
      Object.entries(currentVal).forEach(([key, val]) => {
        if (key === 'source_page') return;
        if (val === null || val === undefined) {
          nextFields[key] = '';
        } else if (typeof val === 'object') {
          nextFields[key] = formatExtractionFieldValue(val);
        } else {
          nextFields[key] = String(val);
        }
      });
      setEditedFieldsMap(nextFields);
      setEditedTextValue('');
    } else {
      setEditedFieldsMap({});
      setEditedTextValue(
        currentVal === null || currentVal === undefined
          ? ''
          : formatExtractionFieldValue(currentVal)
      );
    }
  };

  const saveEditedExtraction = async (ext: TenderExtraction) => {
    const currentVal =
      ext.userEditedValue !== undefined && ext.userEditedValue !== null
        ? ext.userEditedValue
        : ext.value !== undefined
          ? ext.value
          : ext.valueJson;

    let updatedPayload: any;

    if (Object.keys(editedFieldsMap).length > 0) {
      const baseObj =
        typeof currentVal === 'object' &&
        currentVal !== null &&
        !Array.isArray(currentVal)
          ? { ...currentVal }
          : {};

      Object.entries(editedFieldsMap).forEach(([key, textVal]) => {
        const trimmed = textVal.trim();
        baseObj[key] = trimmed === '' ? null : trimmed;
      });
      updatedPayload = baseObj;
    } else {
      updatedPayload = editedTextValue.trim();
    }

    await editExtractionValue(ext, updatedPayload, 'confirmado');
    setEditingExtractionId(null);
    setEditedFieldsMap({});
  };

  const openPendingModal = (req: TenderRequirement) => {
    setPendingModalReq(req);
    setPendingOwner(req.ownerId || actorId || '');
    setPendingDueDate(req.dueDate || licitacion.fechaCierre || '');
    setPendingNotes('');
  };

  const handleCreatePendingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingModalReq) return;
    setIsSubmittingPending(true);
    try {
      await createPendingInCrm(pendingModalReq, {
        ownerId: pendingOwner || actorId,
        dueDate: pendingDueDate,
        notes: pendingNotes,
      });
      setPendingModalReq(null);
      onPendingCreated?.();
    } finally {
      setIsSubmittingPending(false);
    }
  };

  const handleSendExtractionToMatrix = async (
    ext: TenderExtraction,
    subKey?: string,
    subValue?: any
  ) => {
    const actionKey = subKey ? `${ext.id}:${subKey}` : ext.id;
    setSendingExtractionKey(actionKey);
    try {
      const created = await createRequirementFromExtraction(ext, {
        subKey,
        subValue,
        dueDate: licitacion.fechaCierre || '',
      });
      if (created?.evidence && created.evidence.length > 0) {
        setSelectedRequirementForEvidence(created);
      }
    } finally {
      setSendingExtractionKey(null);
    }
  };

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqTitle.trim()) return;

    const initialEvidence = newReqEvQuote.trim()
      ? {
          documentId: newReqEvDocId || documents[0]?.id || '',
          pageNumber: Number(newReqEvPage) || 1,
          quoteText: newReqEvQuote.trim(),
          notes: newReqEvNotes.trim(),
        }
      : undefined;

    const created = await addRequirement(
      {
        category: newReqCategory,
        title: newReqTitle.trim(),
        description:
          newReqDesc.trim() || 'Requisito técnico/administrativo de bases.',
        isMandatory: newReqIsMandatory,
        dueDate: newReqDueDate,
        ownerId: actorId,
        status: 'pendiente',
      },
      initialEvidence
    );
    if (created?.evidence && created.evidence.length > 0) {
      setSelectedRequirementForEvidence(created);
    }
    setNewReqTitle('');
    setNewReqDesc('');
    setNewReqIsMandatory(true);
    setNewReqOwner(actorId);
    setNewReqEvPage('');
    setNewReqEvQuote('');
    setNewReqEvNotes('');
    setShowNewReqForm(false);
  };

  const openAttachEvidenceModal = (req: TenderRequirement) => {
    setEvidenceModalReq(req);
    setEvDocumentId(documents[0]?.id || '');
    setEvPageNumber(1);
    setEvQuoteText('');
    setEvNotes('');
  };

  const handleAttachEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceModalReq || !evQuoteText.trim()) return;
    const targetDocId = evDocumentId || documents[0]?.id || '';

    setIsSubmittingEvidence(true);
    try {
      const createdEv = await attachEvidence({
        requirementId: evidenceModalReq.id,
        documentId: targetDocId,
        pageNumber: Number(evPageNumber) || 1,
        quoteText: evQuoteText.trim(),
        notes: evNotes.trim(),
      });
      setSelectedRequirementForEvidence((prev) =>
        prev && prev.id === evidenceModalReq.id
          ? { ...prev, evidence: [...(prev.evidence || []), createdEv] }
          : {
              ...evidenceModalReq,
              evidence: [...(evidenceModalReq.evidence || []), createdEv],
            }
      );
      setEvidenceModalReq(null);
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  const handleAskRag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragInput.trim() || isAskingRag) return;
    const q = ragInput;
    setRagInput('');
    const res = await askQuestion(q);
    if (res?.citations && res.citations.length > 0) {
      setSelectedCitation(res.citations[0]);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fadeIn"
      >
        {/* Cabecera del Expediente Inteligente */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50/80 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                {licitacion.codigo}
              </span>
              <StatusBadge estado={licitacion.estado} />
              {dossier && <StatusBadge estado={dossier.status} />}
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                {licitacion.categoria}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {licitacion.titulo}
            </h3>
          </div>

          <div className="flex items-center gap-2 ml-4 shrink-0">
            <button
              onClick={() => refreshAnalysis()}
              disabled={isLoading}
              title="Refrescar análisis consolidado"
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Resumen Ejecutivo */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Convocante
              </span>
              <p className="text-xs font-semibold text-slate-800 truncate">
                {licitacion.entidad}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Presupuesto
              </span>
              <p className="text-xs font-bold text-slate-900">
                {formatCurrency(licitacion.presupuestoEstimado, licitacion.moneda)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Fecha Cierre
              </span>
              <p className="text-xs font-semibold text-slate-800">
                {licitacion.fechaCierre}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Trazabilidad Forense
              </span>
              <p className="text-xs font-semibold text-indigo-700">
                {auditLogs.length} eventos registrados
              </p>
            </div>
          </div>
        </div>

        {/* Navegación de las 5 Pestañas del Expediente Inteligente */}
        <div className="px-6 bg-slate-50/70 border-b border-slate-200 flex items-center gap-1 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('documentos')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'documentos'
                ? 'border-blue-600 text-blue-600 bg-white/80'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Pliegos y Procesamiento</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-200/80 text-slate-700">
              {documents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('extracciones')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'extracciones'
                ? 'border-blue-600 text-blue-600 bg-white/80'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. Extracciones IA</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-200/80 text-slate-700">
              {extractions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requisitos')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'requisitos'
                ? 'border-blue-600 text-blue-600 bg-white/80'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>3. Matriz de Cumplimiento y CRM</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-200/80 text-slate-700">
              {requirements.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rag')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'rag'
                ? 'border-blue-600 text-blue-600 bg-white/80'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>4. Asistente Consultas (RAG)</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-200/80 text-slate-700">
              {questions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('auditoria')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'auditoria'
                ? 'border-blue-600 text-blue-600 bg-white/80'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>5. Historial de Auditoría</span>
          </button>
        </div>

        {/* Contenido Principal Desplegable por Pestaña */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/30">
          {/* Barra de Progreso Asíncrona en Tiempo Real (si hay un job corriendo) */}
          {activeJob && (
            <div className="p-4 rounded-2xl bg-indigo-950 text-white border border-indigo-800 shadow-md space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-300 animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                    Pipeline Asíncrono IA ({activeJob.jobType})
                  </span>
                </div>
                <span className="text-xs font-mono font-bold bg-indigo-900 px-2.5 py-0.5 rounded-full text-indigo-200">
                  {activeJob.progressPercentage}%
                </span>
              </div>
              <p className="text-xs text-indigo-100">{activeJob.currentStep}</p>
              <div className="w-full h-2.5 bg-indigo-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${activeJob.progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-indigo-300">
                <span>5% Validación</span>
                <span>35% OCR</span>
                <span>55% Extracción IA</span>
                <span>75% Matriz + RAG</span>
                <span>100% Completado</span>
              </div>
            </div>
          )}

          {/* =================================================================
              PESTAÑA 1: DOCUMENTOS Y PROCESAMIENTO ASÍNCRONO
             ================================================================= */}
          {activeTab === 'documentos' && (
            <div className="space-y-5">
              {/* Subida de PDF con SHA-256 */}
              <div className="p-5 rounded-2xl bg-white border border-dashed border-blue-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Cargar Bases o Anexo Técnico (PDF)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Calcula automáticamente la huella criptográfica{' '}
                      <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">
                        SHA-256
                      </code>{' '}
                      para prevenir duplicidad y garantizar no repudio en auditoría.
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'Calculando SHA-256...' : 'Subir Pliego PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Lista de Documentos del Expediente */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Pliegos y Anexos Registrados en el Expediente
                  </h4>
                  <span className="text-xs text-slate-500">
                    {documents.length} documento(s)
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {documents.map((doc) => {
                    const docStatus = doc.processingStatus || doc.status || 'cargado';
                    const docFilename = doc.filename || doc.fileName || 'Pliego.pdf';

                    return (
                      <div
                        key={doc.id}
                        className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {docFilename}
                              </p>
                              <StatusBadge estado={docStatus} />
                              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                {doc.fileType || 'pliego'} • v{doc.version ?? 1}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                              {doc.fileSizeBytes ? (
                                <span>{formatBytes(doc.fileSizeBytes)}</span>
                              ) : null}
                              {doc.pageCount && <span>• {doc.pageCount} páginas</span>}
                              <span
                                className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                                title={`SHA-256: ${doc.checksum}`}
                              >
                                <Hash className="w-3 h-3 text-slate-400" />
                                SHA-256: {doc.checksum.slice(0, 16)}...
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={Boolean(activeJob)}
                            onClick={() => triggerDocumentAnalysis(doc.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Cpu className="w-3.5 h-3.5" />
                            <span>
                              {docStatus === 'analizado'
                                ? 'Re-analizar con IA'
                                : 'Disparar Análisis IA'}
                            </span>
                          </button>

                          {confirmDeleteDocId === doc.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-1 rounded-xl">
                              <span className="text-[11px] text-rose-700 font-semibold">
                                ¿Eliminar?
                              </span>
                              <button
                                type="button"
                                onClick={async () => {
                                  await removeDocument(doc.id);
                                  setConfirmDeleteDocId(null);
                                }}
                                className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-lg"
                              >
                                Sí
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteDocId(null)}
                                className="px-2 py-0.5 bg-white text-slate-600 text-[10px] font-semibold rounded-lg border border-slate-200"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteDocId(doc.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              title="Eliminar documento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {documents.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No hay pliegos cargados en este expediente. Sube un archivo PDF para comenzar.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================
              PESTAÑA 2: EXTRACCIONES IA Y VALIDACIÓN HUMANA
             ================================================================= */}
          {activeTab === 'extracciones' && (
            <div className="space-y-6">
              {(
                [
                  'identificacion',
                  'calendario',
                  'economico',
                  'riesgos',
                  'otros',
                ] as ExtractionCategory[]
              ).map((cat) => {
                const catItems = extractions.filter((e) => e.category === cat);
                if (cat === 'otros' && catItems.length === 0) return null;
                const meta = EXTRACTION_CATEGORY_META[cat];

                return (
                  <div
                    key={cat}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
                  >
                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${meta.badgeClass}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {catItems.length} campo(s) extraído(s)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                      {catItems.map((ext) => {
                        const isEditing = editingExtractionId === ext.id;
                        const displayValue =
                          ext.userEditedValue !== undefined && ext.userEditedValue !== null
                            ? ext.userEditedValue
                            : ext.value !== undefined
                              ? ext.value
                              : ext.valueJson;
                        const rawConf = Number(ext.confidence || 0);
                        const confidencePct =
                          rawConf > 1 ? Math.round(rawConf) : Math.round(rawConf * 100);

                        return (
                          <div
                            key={ext.id}
                            className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between gap-3"
                          >
                            <div>
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <div>
                                  <span className="font-mono text-xs font-bold text-slate-800 block">
                                    {ext.fieldKey}
                                  </span>
                                  {ext.documentFilename && (
                                    <span className="text-[10px] text-slate-400">
                                      Fuente: {ext.documentFilename}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      confidencePct >= 90
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'bg-amber-50 text-amber-700'
                                    }`}
                                  >
                                    IA {confidencePct}%
                                  </span>
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                    Pág. {ext.sourcePage}
                                  </span>
                                  <StatusBadge estado={ext.status} />
                                </div>
                              </div>

                              {isEditing ? (
                                <div className="p-3.5 rounded-xl bg-white border border-blue-300 shadow-2xs space-y-3 mt-2">
                                  {Object.keys(editedFieldsMap).length > 0 ? (
                                    <div className="space-y-2.5">
                                      {Object.entries(editedFieldsMap).map(
                                        ([fieldName, fieldVal]) => (
                                          <div key={fieldName} className="space-y-1">
                                            <label className="block text-[11px] font-semibold text-slate-600 capitalize">
                                              {fieldName.replace(/_/g, ' ')}
                                            </label>
                                            <input
                                              type="text"
                                              placeholder="Sin especificar..."
                                              value={fieldVal}
                                              onChange={(e) =>
                                                setEditedFieldsMap((prev) => ({
                                                  ...prev,
                                                  [fieldName]: e.target.value,
                                                }))
                                              }
                                              className="w-full px-3 py-1.5 text-xs text-slate-950 font-medium placeholder:text-slate-400 bg-slate-50/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg outline-none transition-colors"
                                            />
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <label className="block text-[11px] font-semibold text-slate-600">
                                        Valor del campo
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Ingresa el valor..."
                                        value={editedTextValue}
                                        onChange={(e) =>
                                          setEditedTextValue(e.target.value)
                                        }
                                        className="w-full px-3 py-1.5 text-xs text-slate-950 font-medium placeholder:text-slate-400 bg-slate-50/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg outline-none transition-colors"
                                      />
                                    </div>
                                  )}

                                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingExtractionId(null);
                                        setEditedFieldsMap({});
                                      }}
                                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200/70 bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => saveEditedExtraction(ext)}
                                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                                    >
                                      Guardar y Confirmar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
                                  {typeof displayValue === 'object' &&
                                  displayValue !== null &&
                                  !Array.isArray(displayValue) ? (
                                    Object.entries(displayValue)
                                      .filter(([k]) => k !== 'source_page')
                                      .map(([k, v]) => {
                                        const subActionKey = `${ext.id}:${k}`;
                                        const isSendingSub =
                                          sendingExtractionKey === subActionKey;
                                        return (
                                          <div
                                            key={k}
                                            className="flex items-center justify-between gap-2 border-b border-slate-50 pb-1.5 last:border-none last:pb-0"
                                          >
                                            <span className="text-slate-400 font-medium capitalize">
                                              {k.replace(/_/g, ' ')}:
                                            </span>
                                            <div className="flex items-center gap-2">
                                              <span
                                                className={`font-semibold text-right ${
                                                  v === null || v === undefined
                                                    ? 'text-slate-400 italic font-normal'
                                                    : 'text-slate-800'
                                                }`}
                                              >
                                                {formatExtractionFieldValue(v)}
                                              </span>
                                              {v !== null && v !== undefined && (
                                                <button
                                                  type="button"
                                                  disabled={Boolean(
                                                    sendingExtractionKey
                                                  )}
                                                  onClick={() =>
                                                    handleSendExtractionToMatrix(
                                                      ext,
                                                      k,
                                                      v
                                                    )
                                                  }
                                                  title="Crear requisito con evidencia a partir de este campo"
                                                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                                                >
                                                  <Plus className="w-2.5 h-2.5" />
                                                  <span>
                                                    {isSendingSub
                                                      ? '...'
                                                      : 'Requisito'}
                                                  </span>
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })
                                  ) : (
                                    <p className="font-semibold text-slate-800">
                                      {formatExtractionFieldValue(displayValue)}
                                    </p>
                                  )}
                                  {(ext.isUserEdited ||
                                    (ext.userEditedValue !== undefined &&
                                      ext.userEditedValue !== null)) && (
                                    <span className="inline-block mt-1 text-[10px] text-indigo-600 font-semibold">
                                      * Editado y validado por analista humano
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {!isEditing && (
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                                <button
                                  type="button"
                                  disabled={Boolean(sendingExtractionKey)}
                                  onClick={() => handleSendExtractionToMatrix(ext)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
                                  <span>
                                    {sendingExtractionKey === ext.id
                                      ? 'Creando requisito...'
                                      : 'Crear Requisito con Evidencia'}
                                  </span>
                                </button>

                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => startEditingExtraction(ext)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Editar</span>
                                  </button>
                                  {ext.status !== 'confirmado' && (
                                    <button
                                      type="button"
                                      onClick={() => confirmExtraction(ext)}
                                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Confirmar</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {catItems.length === 0 && (
                        <div className="col-span-full py-4 text-center text-xs text-slate-400">
                          Sin extracciones registradas en esta categoría.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* =================================================================
              PESTAÑA 3: MATRIZ DE CUMPLIMIENTO Y SINCRONIZACIÓN CRM
             ================================================================= */}
          {activeTab === 'requisitos' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Matriz de Requisitos Legales, Técnicos y Financieros
                  </h4>
                  <p className="text-xs text-slate-500">
                    Verifica el extracto probatorio del pliego y delega tareas operativas a{' '}
                    <strong>Limenka360 CRM </strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!showNewReqForm) {
                      setNewReqOwner(actorId);
                    }
                    setShowNewReqForm(!showNewReqForm);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Requisito</span>
                </button>
              </div>

              {showNewReqForm && (
                <form
                  onSubmit={handleCreateRequirement}
                  className="p-4 rounded-2xl bg-white border border-blue-200 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Título del requisito..."
                      value={newReqTitle}
                      onChange={(e) => setNewReqTitle(e.target.value)}
                      className="sm:col-span-2 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                    />
                    <select
                      value={newReqCategory}
                      onChange={(e) =>
                        setNewReqCategory(e.target.value as RequirementCategory)
                      }
                      className="px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                    >
                      <option value="tecnico">Técnico</option>
                      <option value="legal">Legal</option>
                      <option value="financiero">Financiero</option>
                      <option value="administrativo">Administrativo</option>
                    </select>
                    <label className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newReqIsMandatory}
                        onChange={(e) => setNewReqIsMandatory(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>
                        {newReqIsMandatory ? 'Obligatorio' : 'Opcional'}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Descripción o especificación..."
                      value={newReqDesc}
                      onChange={(e) => setNewReqDesc(e.target.value)}
                      className="sm:col-span-1 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                    />
                    <input
                      type="text"
                      readOnly
                      placeholder="Responsable asignado"
                      value={actorName}
                      className="px-3 py-2 text-xs font-medium text-slate-900 bg-slate-100 border border-slate-200 rounded-xl outline-none cursor-not-allowed"
                    />
                    <input
                      type="date"
                      value={newReqDueDate}
                      onChange={(e) => setNewReqDueDate(e.target.value)}
                      className="px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Sección opcional para anexar evidencia documental (POST /requirement_evidence) al crear */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="block text-[11px] font-semibold text-slate-600">
                      Evidencia probatoria del pliego (opcional — vincula página y cita textual)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <select
                        value={newReqEvDocId || documents[0]?.id || ''}
                        onChange={(e) => setNewReqEvDocId(e.target.value)}
                        className="px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                      >
                        {documents.length === 0 ? (
                          <option value="">Sin documentos cargados</option>
                        ) : (
                          documents.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.filename || d.fileName || d.id}
                            </option>
                          ))
                        )}
                      </select>
                      <input
                        type="number"
                        min={1}
                        placeholder="No. Página (ej. 12)"
                        value={newReqEvPage}
                        onChange={(e) => setNewReqEvPage(e.target.value)}
                        className="px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                      />
                      <input
                        type="text"
                        placeholder="Cita textual literal del pliego..."
                        value={newReqEvQuote}
                        onChange={(e) => setNewReqEvQuote(e.target.value)}
                        className="px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nota (ej. Numeral 4.1)"
                          value={newReqEvNotes}
                          onChange={(e) => setNewReqEvNotes(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer shrink-0"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Tabla de Requisitos */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Requisito / Categoría</th>
                        <th className="py-3 px-3">Evidencia Pliego</th>
                        <th className="py-3 px-3">Responsable</th>
                        <th className="py-3 px-3">Vencimiento</th>
                        <th className="py-3 px-3 text-center">Semáforo</th>
                        <th className="py-3 px-4 text-right">Sincronización CRM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {requirements.map((req) => {
                        const firstEv = req.evidence?.[0];
                        const isDelegated =
                          req.status === 'en_proceso' || Boolean(req.pendingId);

                        return (
                          <tr key={req.id} className="hover:bg-slate-50/70">
                            <td className="py-3.5 px-4 max-w-xs">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {req.category}
                                </span>
                                {req.isMandatory ? (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                                    Obligatorio
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                    Opcional
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold text-slate-900">{req.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                                {req.description}
                              </p>
                            </td>

                            <td className="py-3.5 px-3 whitespace-nowrap">
                              {firstEv ? (
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedRequirementForEvidence(
                                        selectedRequirementForEvidence?.id === req.id
                                          ? null
                                          : req
                                      )
                                    }
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition-colors cursor-pointer"
                                  >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>Pág. {firstEv.pageNumber} • Ver cita</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openAttachEvidenceModal(req)}
                                    title="Anexar otra cita"
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => openAttachEvidenceModal(req)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[11px] font-semibold border border-slate-200 transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Sin cita • Vincular</span>
                                </button>
                              )}
                            </td>

                            <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-800">
                              {req.ownerId === actorId ? actorName : req.ownerId}
                            </td>

                            <td className="py-3.5 px-3 whitespace-nowrap font-mono text-slate-600">
                              {formatDateYMD(req.dueDate)}
                            </td>

                            <td className="py-3.5 px-3 text-center whitespace-nowrap">
                              <div className="inline-flex flex-col items-center gap-1">
                                <StatusBadge estado={req.status} />
                                <select
                                  value={req.status}
                                  onChange={(e) =>
                                    updateRequirementStatus(
                                      req,
                                      e.target.value as RequirementStatus
                                    )
                                  }
                                  className="px-2 py-0.5 text-[10px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-md outline-none focus:border-blue-500 cursor-pointer"
                                >
                                  <option value="pendiente">Pendiente</option>
                                  <option value="en_proceso">En Proceso</option>
                                  <option value="cumple">Cumple</option>
                                  <option value="no_cumple">No Cumple</option>
                                  <option value="riesgo">Con Riesgo</option>
                                </select>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                {isDelegated ? (
                                  <div className="inline-flex items-center gap-1.5">
                                    <span
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold"
                                      title={
                                        req.pendingId
                                          ? `Folio CRM: ${req.pendingId}`
                                          : 'Tarea en proceso en CRM'
                                      }
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>
                                        Delegado en CRM
                                        {req.pendingId
                                          ? ` (${req.pendingId.slice(0, 6)})`
                                          : ''}
                                      </span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => openPendingModal(req)}
                                      className="px-2 py-1 text-[10px] font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                    >
                                      Re-asignar
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => openPendingModal(req)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Crear Pendiente en CRM</span>
                                  </button>
                                )}

                                {confirmDeleteReqId === req.id ? (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await removeRequirement(req.id);
                                      setConfirmDeleteReqId(null);
                                    }}
                                    className="px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg"
                                  >
                                    Confirmar
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteReqId(req.id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                                    title="Eliminar requisito"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visor del Extracto Probatorio (requirement_evidence) */}
              {selectedRequirementForEvidence &&
                selectedRequirementForEvidence.evidence &&
                selectedRequirementForEvidence.evidence.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-amber-600" />
                        Extracto Probatorio en Bases — {selectedRequirementForEvidence.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedRequirementForEvidence(null)}
                        className="text-xs text-amber-700 hover:underline"
                      >
                        Ocultar cita
                      </button>
                    </div>
                    {selectedRequirementForEvidence.evidence.map((ev) => {
                      const docMatch = documents.find((d) => d.id === ev.documentId);
                      return (
                        <div
                          key={ev.id}
                          className="p-3 rounded-xl bg-white border border-amber-200/80 text-xs text-slate-700 space-y-1"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono font-bold text-blue-600">
                              [Página {ev.pageNumber}]
                            </span>
                            {docMatch && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                Documento: {docMatch.filename || docMatch.fileName}
                              </span>
                            )}
                          </div>
                          <p className="italic text-slate-800">&ldquo;{ev.quoteText}&rdquo;</p>
                          {ev.notes && (
                            <p className="text-[11px] text-slate-500">
                              Nota: {ev.notes}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          )}

          {/* =================================================================
              PESTAÑA 4: ASISTENTE DE CONSULTAS (RAG)
             ================================================================= */}
          {activeTab === 'rag' && (
            <div className="space-y-4">
              <form
                onSubmit={handleAskRag}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  placeholder="Pregunta al pliego (ej. ¿Cuáles son las penas convencionales o fechas de junta de aclaraciones?)..."
                  value={ragInput}
                  onChange={(e) => setRagInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 outline-none"
                />
                <button
                  type="submit"
                  disabled={isAskingRag || !ragInput.trim()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAskingRag ? 'Consultando RAG...' : 'Preguntar al Pliego'}</span>
                </button>
              </form>

              {/* Cita seleccionada para inspección */}
              {selectedCitation && (
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2 animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-blue-900">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>
                        Cita Documental • Página{' '}
                        {selectedCitation.page ?? selectedCitation.pageNumber ?? 1}
                      </span>
                      {selectedCitation.filename && (
                        <span className="px-2 py-0.5 rounded-md bg-white text-slate-700 font-medium border border-blue-100">
                          {selectedCitation.filename}
                        </span>
                      )}
                      {selectedCitation.chunkId && (
                        <span className="font-mono text-[11px] text-blue-700">
                          Chunk: {selectedCitation.chunkId}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px]">
                        Relevancia{' '}
                        {Math.round(
                          Number(
                            selectedCitation.score ??
                              selectedCitation.relevanceScore ??
                              0
                          ) * 100
                        )}
                        %
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCitation(null)}
                      className="text-blue-700 hover:underline cursor-pointer"
                    >
                      Cerrar cita
                    </button>
                  </div>
                  <p className="text-xs italic text-slate-800 bg-white p-3.5 rounded-xl border border-blue-100 whitespace-pre-line">
                    &ldquo;{selectedCitation.excerpt}&rdquo;
                  </p>
                </div>
              )}

              {/* Historial de Preguntas y Respuestas con Citas */}
              <div className="space-y-3">
                {questions.map((q, qIdx) => {
                  const qKey = q.id || q.questionId || `q-${qIdx}`;
                  const confLabel = String(q.confidence || '').toLowerCase();
                  const confBadgeClass =
                    confLabel === 'alta'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : confLabel === 'baja'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200';

                  return (
                    <div
                      key={qKey}
                      className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900">
                          P: {q.question}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          {q.confidence && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${confBadgeClass}`}
                            >
                              Confianza: {q.confidence}
                            </span>
                          )}
                          {q.createdAt && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {formatDateYMD(q.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                        {q.answer}
                      </p>

                      {q.warnings && q.warnings.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1">
                          {q.warnings.map((w, wIdx) => (
                            <p key={wIdx} className="flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>{w}</span>
                            </p>
                          ))}
                        </div>
                      )}

                      {q.citations && q.citations.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Citas verificadas:
                          </span>
                          {q.citations.map((cit, idx) => {
                            const pageNum = cit.page ?? cit.pageNumber ?? 1;
                            const rawScore = Number(
                              cit.score ?? cit.relevanceScore ?? 0
                            );
                            const scorePct =
                              rawScore > 1
                                ? Math.round(rawScore)
                                : Math.round(rawScore * 100);

                            return (
                              <button
                                key={cit.id || `${qKey}-cit-${idx}`}
                                type="button"
                                onClick={() => setSelectedCitation(cit)}
                                title={cit.filename || 'Ver extracto del documento'}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>Pág. {pageNum}</span>
                                {cit.filename && (
                                  <span className="max-w-[180px] truncate text-[10px] text-indigo-600 font-normal">
                                    • {cit.filename}
                                  </span>
                                )}
                                <span className="text-[10px] text-indigo-500">
                                  ({scorePct}%)
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {questions.length === 0 && (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
                    Formula una pregunta sobre las bases de licitación para consultar el motor RAG con citas verificadas por página.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================
              PESTAÑA 5: HISTORIAL DE AUDITORÍA (tender_audit_log)
             ================================================================= */}
          {activeTab === 'auditoria' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Bitácora de Auditoría Forense 
                  </h4>
                  <p className="text-xs text-slate-500">
                    Registro inmutable de cargas SHA-256, confirmaciones humanas y delegaciones al CRM.
                  </p>
                </div>

                {confirmDeleteDossier ? (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-semibold text-rose-800">
                      ¿Eliminar expediente completo?
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        await removeDossier();
                        setConfirmDeleteDossier(false);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg"
                    >
                      Confirmar 
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteDossier(false)}
                      className="px-2.5 py-1 bg-white text-slate-600 text-xs font-semibold rounded-lg border border-slate-200"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteDossier(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Expediente</span>
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-3">Responsable</th>
                        <th className="py-3 px-3">Acción</th>
                        <th className="py-3 px-3">Módulo</th>
                        <th className="py-3 px-4">Estado Anterior</th>
                        <th className="py-3 px-4">Estado Nuevo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70 align-top">
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            {formatDateYMD(log.createdAt)}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                            {log.actorId === actorId ||
                            !log.actorId ||
                            log.actorId.length >= 20
                              ? actorName
                              : log.actorId}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            {log.entityName}
                          </td>
                          <td className="py-3 px-4">
                            {renderAuditStateCard(log.beforeJson, 'before')}
                          </td>
                          <td className="py-3 px-4">
                            {renderAuditStateCard(log.afterJson, 'after')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <strong>{documents.length}</strong> pliegos activos
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <strong>
                {extractions.filter((e) => e.status === 'confirmado').length}/
                {extractions.length}
              </strong>{' '}
              extracciones confirmadas
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Expediente
          </button>
        </div>

        {/* Sub-Modal: Crear Pendiente en CRM (POST /tender_requirements/:id/create-pending) */}
        {pendingModalReq && (
          <div
            onClick={() => setPendingModalReq(null)}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          >
            <form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleCreatePendingSubmit}
              className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 animate-fadeIn"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    Crear Pendiente desde Requisito
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingModalReq(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <strong className="block text-slate-900">{pendingModalReq.title}</strong>
                <span className="text-[11px] text-slate-500">
                  Categoría: {pendingModalReq.category.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsable
                  </label>
                  <input
                    type="text"
                    readOnly
                    title={`ID a enviar: ${pendingOwner || actorId}`}
                    value={
                      !pendingOwner || pendingOwner === actorId
                        ? actorName
                        : pendingOwner
                    }
                    className="w-full px-3 py-2 text-xs font-medium text-slate-900 bg-slate-100 border border-slate-200 rounded-xl outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha Límite
                  </label>
                  <input
                    type="date"
                    required
                    value={pendingDueDate}
                    onChange={(e) => setPendingDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Instrucciones / Notas
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={pendingNotes}
                    onChange={(e) => setPendingNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingModalReq(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPending}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPending ? 'Sincronizando...' : 'Delegar Tarea a CRM'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sub-Modal: Vincular Evidencia Documental del Pliego (POST /requirement_evidence) */}
        {evidenceModalReq && (
          <div
            onClick={() => setEvidenceModalReq(null)}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
          >
            <form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleAttachEvidenceSubmit}
              className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 animate-fadeIn"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                    <Quote className="w-3.5 h-3.5" />
                    Evidencia Documental del Pliego
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    Vincular Cita Textual al Requisito
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setEvidenceModalReq(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <strong className="block text-slate-900">{evidenceModalReq.title}</strong>
                <span className="text-[11px] text-slate-500">
                  Categoría: {evidenceModalReq.category.toUpperCase()} •{' '}
                  {evidenceModalReq.isMandatory ? 'Obligatorio' : 'Opcional'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Documento del Expediente 
                    </label>
                    <select
                      value={evDocumentId || documents[0]?.id || ''}
                      onChange={(e) => setEvDocumentId(e.target.value)}
                      className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                    >
                      {documents.length === 0 ? (
                        <option value="">Pliego activo del expediente</option>
                      ) : (
                        documents.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.filename} (v{doc.version})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Página 
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={evPageNumber}
                      onChange={(e) => setEvPageNumber(Number(e.target.value) || 1)}
                      className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cita Textual del Pliego 
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={evQuoteText}
                    onChange={(e) => setEvQuoteText(e.target.value)}
                    placeholder='Ej. "El licitante deberá presentar copia simple y original para cotejo de la Licencia Sanitaria vigente..."'
                    className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nota Interpretativa 
                  </label>
                  <input
                    type="text"
                    value={evNotes}
                    onChange={(e) => setEvNotes(e.target.value)}
                    placeholder="Ej. Requisito descalificatorio según numeral 4.1"
                    className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEvidenceModalReq(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvidence}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEvidence ? 'Guardando cita...' : 'Vincular Evidencia'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
