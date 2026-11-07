import React from 'react';
import Head from 'next/head';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuth } from '@/domain/auth/hooks/useAuth';
import { ShieldAlert, LogOut, Mail, HelpCircle, FileText } from 'lucide-react';

export default function SinAccesoPage() {
  const { user } = useAuthStore();
  const { logout, isLoading } = useAuth();

  const roleName = user?.roleId || user?.role || user?.type || 'No asignado';

  return (
    <>
      <Head>
        <title>Rol No Activo | Limenka Licitaciones</title>
      </Head>

      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white selection:bg-blue-500 selection:text-white">
        <div className="max-w-lg w-full bg-slate-800/90 border border-slate-700/80 p-8 sm:p-10 rounded-3xl text-center shadow-2xl backdrop-blur-md">
          {/* Badge Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="inline-block text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
            Acceso No Configurado
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Rol no activo en este portal
          </h1>

          <p className="text-slate-300 text-sm mt-3 leading-relaxed">
            Has iniciado sesión exitosamente como{' '}
            <strong className="text-white">{user?.name || user?.username}</strong>, pero tu rol actual:{' '}
            <span className="font-mono bg-slate-900 text-amber-300 px-2 py-0.5 rounded text-xs font-semibold">
              {roleName}
            </span>{' '}
            no cuenta con módulos ni pantallas activas dentro de <strong>Limenka Licitaciones</strong>.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 text-left text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Portal de Adquisiciones y Licitaciones</span>
            </div>
            <p className="leading-relaxed">
              Este sistema está reservado exclusivamente para la administración de procesos licitatorios, dictámenes técnicos y posturas de proveedores.
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={logout}
              disabled={isLoading}
              className="w-full sm:flex-1 py-3 px-5 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-medium text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>

            <a
              href="mailto:soporte@limenka.com"
              className="w-full sm:flex-1 py-3 px-5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 text-center"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Contactar Soporte</span>
            </a>
          </div>

          <p className="text-[11px] text-slate-500 mt-6">
            Si consideras que esto es un error, solicita a tu administrador la asignación del rol de licitador o evaluador.
          </p>
        </div>
      </div>
    </>
  );
}

