import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { DashboardLayout } from '@/shared/components/DashboardLayout';
import { useLicitaciones } from '@/domain/licitaciones/hooks/useLicitaciones';
import { LicitacionesFilters } from '@/domain/licitaciones/components/LicitacionesFilters';
import { LicitacionesTable } from '@/domain/licitaciones/components/LicitacionesTable';
import { ModalNuevaLicitacion } from '@/domain/licitaciones/components/ModalNuevaLicitacion';
import { LicitacionDetalleModal } from '@/domain/licitaciones/components/LicitacionDetalleModal';
import { licitacionesService } from '@/domain/licitaciones/services/licitacionesService';
import { LicitacionOrder, LicitacionPending } from '@/domain/licitaciones/types/licitacion.types';
import {
  Plus,
  Briefcase,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/lib/alerts';
import Link from 'next/link';

export default function LicitacionesDashboardPage() {
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
    refresh,
  } = useLicitaciones();

  const [orders, setOrders] = useState<LicitacionOrder[]>([]);
  const [pendings, setPendings] = useState<LicitacionPending[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadExtraData = async () => {
    const [ordersData, pendingsData] = await Promise.all([
      licitacionesService.getOrders(),
      licitacionesService.getPendings(),
    ]);
    setOrders(ordersData);
    setPendings(pendingsData);
  };

  useEffect(() => {
    loadExtraData();
  }, []);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refresh(), loadExtraData()]);
      toast.success('Datos actualizados correctamente');
    } finally {
      setIsRefreshing(false);
    }
  };

  const totalPresupuesto = licitaciones.reduce((acc, l) => acc + l.presupuestoEstimado, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <DashboardLayout
      title="Dashboard de Licitaciones"
      allowedRoles={['admin', 'licitaciones', 'licitador', 'comprador', 'evaluador']}
      onRefresh={handleRefreshAll}
      isRefreshing={isRefreshing}
    >
      <Head>
        <title>Dashboard de Licitaciones | Limenka Licitaciones</title>
      </Head>

      <div className="space-y-6">
        {/* Cabecera Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard de Licitaciones y Convocatorias
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Control general de procesos, compras, pliegos técnicos y fechas de entrega
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing || isLoading}
              title="Actualizar datos del dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4 h-4 text-blue-600 transition-transform ${
                  isRefreshing || isLoading ? 'animate-spin' : ''
                }`}
              />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <Link
              href="/licitaciones/proyectos"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all"
            >
              Ver Tablero Proyectos
            </Link>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Licitación</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de Métricas Principales (Igual que en LateralCards de crm-jobs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Licitaciones Activas
              </span>
              <Briefcase className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{licitaciones.length}</p>
            <p className="text-xs text-blue-600 font-medium mt-1">Convocatorias vigentes</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Monto Consolidado
              </span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalPresupuesto)}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Presupuesto en juego</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Pedidos / Órdenes
              </span>
              <ShoppingCart className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
            <p className="text-xs text-slate-500 mt-1">Órdenes de compra registradas</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Pendientes y Fechas
              </span>
              <Calendar className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{pendings.length}</p>
            <p className="text-xs text-slate-500 mt-1">Plazos críticos por vencer</p>
          </div>
        </div>

        {/* Sección Dividida: Listado de Licitaciones + Agenda de Pendientes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Tabla y Filtros */}
          <div className="lg:col-span-2 space-y-4">
            <LicitacionesFilters
              filters={filters}
              onChange={setFilters}
              totalResults={licitaciones.length}
            />

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
          </div>

          {/* Columna Derecha: Agenda de Pendientes y Órdenes Activas */}
          <div className="space-y-6">
            {/* Tarjeta de Pendientes Críticos */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <h3 className="font-semibold text-sm text-slate-900">Agenda de Pendientes</h3>
                </div>
                <Link
                  href="/licitaciones/tableros"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Ver todos
                </Link>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                {pendings.map((pen) => (
                  <div key={pen.id} className="py-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {pen.subject}
                      </p>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold shrink-0">
                        {pen.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {pen.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1.5">
                      <Calendar className="w-3 h-3" />
                      <span>Límite: {pen.date_from}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tarjeta de Órdenes Recientes */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-semibold text-sm text-slate-900">Órdenes / Suministros</h3>
                </div>
              </div>

              <div className="divide-y divide-slate-100 mt-2">
                {orders.map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-semibold text-indigo-600 block">
                        {ord.folio}
                      </span>
                      <p className="text-xs text-slate-600 truncate max-w-[150px]">
                        {ord.prospectName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block">
                        {formatCurrency(ord.total)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-medium">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Creación */}
        <ModalNuevaLicitacion
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={async (dto) => {
            const creada = await createLicitacion(dto);
            toast.success('Licitación registrada', {
              description: `Se creó exitosamente el proceso ${creada.codigo}.`,
            });
          }}
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
