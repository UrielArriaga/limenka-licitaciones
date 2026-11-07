import Head from 'next/head';
import { DashboardLayout } from '@/shared/components/DashboardLayout';
import { FileCheck, Shield, CheckCircle, Clock } from 'lucide-react';

export default function EvaluacionPage() {
  return (
    <DashboardLayout title="Módulo de Evaluación y Dictámenes" allowedRoles={['admin', 'evaluador']}>
      <Head>
        <title>Evaluación y Dictámenes | Limenka Licitaciones</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Comité de Evaluación y Dictámenes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Revisión de propuestas técnicas y económicas, ponderación de criterios y emisión de fallos.
          </p>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Dictámenes Pendientes
              </span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">5</p>
            <p className="text-xs text-amber-600 mt-1">Requieren firma del comité</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Propuestas Evaluadas
              </span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">24</p>
            <p className="text-xs text-slate-500 mt-1">En el periodo actual</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Criterios Normativos
              </span>
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-base font-semibold text-slate-800">Matriz Puntos y Porcentajes</p>
            <p className="text-xs text-slate-500 mt-1">Conforme a la Ley de Adquisiciones</p>
          </div>
        </div>

        {/* Placeholder de contenido */}
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            Módulo Exclusivo para Evaluadores
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Aquí podrás asignar puntuaciones técnicas a los proveedores que postularon sus pliegos.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

