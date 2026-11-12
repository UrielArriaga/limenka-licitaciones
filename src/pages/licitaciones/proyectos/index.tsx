import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { DashboardLayout } from '@/shared/components/DashboardLayout';
import { licitacionesService } from '@/domain/licitaciones/services/licitacionesService';
import {
  Licitacion,
  LicitacionProject,
} from '@/domain/licitaciones/types/licitacion.types';
import { LicitacionDetalleModal } from '@/domain/licitaciones/components/LicitacionDetalleModal';
import {
  Building,
  DollarSign,
  User,
  Plus,
  Search,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { toast } from '@/lib/alerts';
import { useDebounce } from '@/shared/hooks/useDebounce';

const PHASES = [
  { id: 'Revisión de Bases', label: 'Revisión de Bases', color: 'border-blue-500 bg-blue-50/50' },
  { id: 'Propuesta Técnica', label: 'Propuesta Técnica', color: 'border-indigo-500 bg-indigo-50/50' },
  { id: 'Fallo y Dictamen', label: 'Fallo y Dictamen', color: 'border-amber-500 bg-amber-50/50' },
  { id: 'Adjudicada', label: 'Adjudicada', color: 'border-emerald-500 bg-emerald-50/50' },
];

export default function LicitacionesProyectosPage() {
  const [projects, setProjects] = useState<LicitacionProject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProjectLicitacion, setSelectedProjectLicitacion] =
    useState<Licitacion | null>(null);

  const openProjectDossier = (prj: LicitacionProject) => {
    setSelectedProjectLicitacion({
      id: prj.id,
      codigo: prj.folio || `PRJ-${prj.id}`,
      titulo: prj.name,
      descripcion: `Expediente inteligente vinculado al proyecto ${prj.folio || prj.id} en fase "${prj.phaseName}".`,
      entidad: prj.prospectName || 'Entidad Convocante',
      categoria: 'Salud',
      estado: prj.phaseName === 'Adjudicada' ? 'adjudicada' : 'en_evaluacion',
      presupuestoEstimado: prj.amount,
      moneda: 'MXN',
      fechaPublicacion: '2026-10-20',
      fechaCierre: prj.expectedDate || '2026-11-28',
      propuestasCount: 4,
      documentosCount: 1,
    });
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await licitacionesService.getProjects();
      setProjects(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.prospectName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.folio?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleMovePhase = (projectId: string, currentPhase: string) => {
    const currentIndex = PHASES.findIndex((p) => p.id === currentPhase);
    const nextIndex = (currentIndex + 1) % PHASES.length;
    const nextPhase = PHASES[nextIndex].id;

    setProjects((prev) =>
      prev.map((item) =>
        item.id === projectId ? { ...item, phaseName: nextPhase } : item
      )
    );

    toast.info(`Proyecto movido a fase: ${nextPhase}`);
  };

  return (
    <DashboardLayout
      title="Tablero de Proyectos de Licitación"
      allowedRoles={['admin', 'licitaciones', 'licitador']}
      onRefresh={fetchProjects}
      isRefreshing={isLoading}
    >
      <Head>
        <title>Proyectos de Licitación | Limenka Licitaciones</title>
      </Head>

      <div className="space-y-6">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Limenka 360 • /oportunities/refactor
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Tablero Kanban de Proyectos
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Gestión visual de convocatorias por etapa: bases, propuestas técnicas, dictámenes y fallos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchProjects}
              disabled={isLoading}
              title="Actualizar proyectos"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4 h-4 text-blue-600 transition-transform ${
                  isLoading ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button
              onClick={() => toast.info('Formulario de registro de proyecto disponible.')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Proyecto</span>
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar proyecto por folio (LIC-...), nombre o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:bg-white focus:border-blue-600 outline-none transition-all"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            <strong>{filteredProjects.length}</strong> proyectos en seguimiento
          </span>
        </div>

        {/* Columnas Kanban */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            Cargando proyectos desde el servidor...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PHASES.map((phase) => {
              const columnProjects = filteredProjects.filter((p) => p.phaseName === phase.id);

              return (
                <div
                  key={phase.id}
                  className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200/80 flex flex-col min-h-[500px]"
                >
                  {/* Encabezado de Columna */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${phase.color.split(' ')[0].replace('border', 'bg')}`} />
                      <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-800">
                        {phase.label}
                      </h3>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      {columnProjects.length}
                    </span>
                  </div>

                  {/* Tarjetas del Kanban */}
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {columnProjects.map((prj) => (
                      <div
                        key={prj.id}
                        onClick={() => openProjectDossier(prj)}
                        className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                          <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {prj.folio}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {prj.expectedDate}
                          </span>
                        </div>

                        <h4 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                          {prj.name}
                        </h4>

                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{prj.prospectName}</span>
                          </div>

                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{formatCurrency(prj.amount)}</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[100px]">{prj.assignedTo}</span>
                            </span>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openProjectDossier(prj);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-[10px]"
                              >
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Expediente IA</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMovePhase(prj.id, prj.phaseName);
                                }}
                                className="text-blue-600 hover:text-blue-800 font-semibold text-[10px] hover:underline"
                              >
                                Avanzar →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {columnProjects.length === 0 && (
                      <div className="text-center py-10 text-xs text-slate-400">
                        Sin proyectos en esta etapa
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <LicitacionDetalleModal
          licitacion={selectedProjectLicitacion}
          onClose={() => setSelectedProjectLicitacion(null)}
        />
      </div>
    </DashboardLayout>
  );
}

