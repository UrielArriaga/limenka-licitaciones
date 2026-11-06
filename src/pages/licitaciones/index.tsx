import Head from 'next/head';
import { DashboardLayout } from '@/shared/components/DashboardLayout';
import { useLicitaciones } from '@/domain/licitaciones/hooks/useLicitaciones';
import { LicitacionesFilters } from '@/domain/licitaciones/components/LicitacionesFilters';
import { LicitacionesTable } from '@/domain/licitaciones/components/LicitacionesTable';
import { ModalNuevaLicitacion } from '@/domain/licitaciones/components/ModalNuevaLicitacion';
import { LicitacionDetalleModal } from '@/domain/licitaciones/components/LicitacionDetalleModal';
import { Plus, Briefcase, CheckCircle, Clock, FileSpreadsheet } from 'lucide-react';

export default function LicitacionesPage() {
  const {
    licitaciones,
    isLoading,
    filters,
    setFilters,
    selectedLicitacion,
    setSelectedLicitacion,
    isCreateModalOpen,
    setIsCreateModalOpen,
    createLicitacion,
  } = useLicitaciones();

  // Métricas rápidas
  const totalLicitaciones = licitaciones.length;
  const enEvaluacion = licitaciones.filter((l) => l.estado === 'en_evaluacion').length;
  const publicadas = licitaciones.filter((l) => l.estado === 'publicada').length;

  return (
    <DashboardLayout title="Gestión de Licitaciones">
      <Head>
        <title>Licitaciones | Limenka Licitaciones</title>
      </Head>

      <div className="space-y-6">
        {/* Cabecera de la Sección */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Licitaciones y Convocatorias
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Administración de procesos licitatorios, pliegos y recepción de ofertas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Licitación</span>
            </button>
          </div>
        </div>

        {/* Resumen de KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Registradas
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalLicitaciones}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Publicadas Activas
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{publicadas}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                En Evaluación
              </p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{enEvaluacion}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Barra de Filtros */}
        <LicitacionesFilters
          filters={filters}
          onChange={setFilters}
          totalResults={licitaciones.length}
        />

        {/* Tabla de Licitaciones */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
            Cargando licitaciones...
          </div>
        ) : (
          <LicitacionesTable
            licitaciones={licitaciones}
            onSelectLicitacion={(lic) => setSelectedLicitacion(lic)}
          />
        )}

        {/* Modal de Creación */}
        <ModalNuevaLicitacion
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={createLicitacion}
        />

        {/* Modal de Detalle */}
        <LicitacionDetalleModal
          licitacion={selectedLicitacion}
          onClose={() => setSelectedLicitacion(null)}
        />
      </div>
    </DashboardLayout>
  );
}

