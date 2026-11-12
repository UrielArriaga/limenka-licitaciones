import { licitacionesService, calculateFileChecksum } from './licitacionesService';

export { calculateFileChecksum };

export const expedienteService = {
  calculateFileChecksum,
  getDossierByProjectId: licitacionesService.getDossierByProjectId,
  createDossier: licitacionesService.createDossier,
  deleteDossier: licitacionesService.deleteDossier,
  resolveBackendFileId: licitacionesService.resolveBackendFileId,
  getDocumentsByDossierId: licitacionesService.getDocumentsByDossierId,
  registerDocument: licitacionesService.registerDocument,
  deleteDocument: licitacionesService.deleteDocument,
  processDocument: licitacionesService.processDocument,
  getProcessingJobsByDossierId: licitacionesService.getProcessingJobsByDossierId,
  createProcessingJob: licitacionesService.createProcessingJob,
  getProcessingJob: licitacionesService.getProcessingJob,
  getExtractionsByDossierId: licitacionesService.getExtractionsByDossierId,
  getRequirementsByDossierId: licitacionesService.getRequirementsByDossierId,
  getDossierAnalysis: licitacionesService.getDossierAnalysis,
  updateExtraction: licitacionesService.updateExtraction,
  createRequirement: licitacionesService.createRequirement,
  updateRequirementStatus: licitacionesService.updateRequirementStatus,
  deleteRequirement: licitacionesService.deleteRequirement,
  addRequirementEvidence: licitacionesService.addRequirementEvidence,
  createRequirementPending: licitacionesService.createRequirementPending,
  askDossierQuestion: licitacionesService.askDossierQuestion,
  getAuditLogs: licitacionesService.getAuditLogs,
  logTenderAudit: licitacionesService.logTenderAudit,
};

