import Head from 'next/head';
import { DashboardLayout } from '@/shared/components/DashboardLayout';
import { Building2, FileText, Send, CheckCircle2 } from 'lucide-react';

export default function ProveedorPage() {
  return (
    <DashboardLayout title="Portal de Proveedores" allowedRoles={['admin', 'proveedor']}>
      <Head>
        <title>Portal de Proveedores | Limenka Licitaciones</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Portal de Proveedores y Concursantes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consulta convocatorias públicas, descarga anexos y presenta tus posturas encriptadas.
          </p>
        </div>

        {/* Métricas del proveedor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Propuestas Enviadas
              </span>
              <Send className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">3</p>
            <p className="text-xs text-slate-500 mt-1">Procesos en participación</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Estatus de Proveedor
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-base font-bold text-emerald-600">Padrón Activo</p>
            <p className="text-xs text-slate-500 mt-1">Vigencia fiscal al corriente</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Documentación Legal
              </span>
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-base font-semibold text-slate-800">100% Completa</p>
            <p className="text-xs text-slate-500 mt-1">Acta constitutiva y poderes validados</p>
          </div>
        </div>

        {/* Placeholder */}
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            Área Exclusiva para Proveedores
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Aquí podrás postular sobres digitales para las convocatorias vigentes.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

