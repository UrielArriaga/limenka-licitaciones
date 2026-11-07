import Head from 'next/head';
import { DashboardLayout } from '@/shared/components/DashboardLayout';
import { Users, Shield, Plus, KeyRound } from 'lucide-react';

export default function AdminUsuariosPage() {
  return (
    <DashboardLayout title="Gestión de Usuarios y Roles" allowedRoles={['admin']}>
      <Head>
        <title>Usuarios y Accesos | Limenka Licitaciones</title>
      </Head>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Control de Accesos y Roles
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Configuración de permisos, asignación de roles (admin, evaluador, licitador, proveedor)
            </p>
          </div>

          <button
            onClick={() => alert('Próximamente: Crear nuevo usuario')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Usuario</span>
          </button>
        </div>

        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            Módulo Exclusivo para Administradores
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Solo cuentas con rol <strong>admin</strong> tienen acceso a esta pantalla.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

