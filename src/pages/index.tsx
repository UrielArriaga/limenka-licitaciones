import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/useAuthStore';
import { DashboardLayout } from '@/shared/components/DashboardLayout';
import {
  FileText,
  Briefcase,
  CheckCircle,
  Shield,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Lock,
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // Si no está autenticado, vista limpia para redirigir al login
  if (!isAuthenticated || !user) {
    return (
      <>
        <Head>
          <title>Limenka Licitaciones | Portal de Acceso</title>
        </Head>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-2xl text-center max-w-md w-full">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Limenka Licitaciones
            </h2>
            <p className="text-sm text-slate-600 mt-2 mb-6">
              Inicia sesión con tus credenciales institucionales para gestionar los procesos de contratación y licitaciones.
            </p>
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all"
            >
              <span>Acceder al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </>
    );
  }

  // Vista principal con DashboardLayout
  return (
    <DashboardLayout title="Panel General">
      <Head>
        <title>Dashboard | Limenka Licitaciones</title>
      </Head>

      <div className="space-y-6">
        {/* Banner de Bienvenida */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-medium mb-3 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>Panel Administrativo</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                ¡Hola de nuevo, {user.name || user.username}!
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                Bienvenido al portal centralizado de gestión licitatoria de Limenka.
              </p>
            </div>

            <Link
              href="/licitaciones"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-900 hover:bg-slate-100 text-sm font-semibold rounded-xl shadow-sm transition-all self-start sm:self-auto cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Ver Licitaciones</span>
            </Link>
          </div>
        </div>

        {/* Tarjetas de Estadísticas Globales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Licitaciones Activas
              </span>
              <Briefcase className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">4</p>
            <p className="text-xs text-slate-500 mt-1">Convocatorias en curso</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Propuestas Recibidas
              </span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">19</p>
            <p className="text-xs text-slate-500 mt-1">En revisión preliminar</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Presupuesto Total
              </span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">$30.7M</p>
            <p className="text-xs text-slate-500 mt-1">MXN consolidado</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Seguridad
              </span>
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-base font-semibold text-slate-800">Cifrado Activo</p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <Lock className="w-3 h-3" /> TLS 1.3 Auditado
            </p>
          </div>
        </div>

        {/* Acceso Rápido al Módulo de Licitaciones */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Módulo de Licitaciones</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Consulta los pliegos, filtra por estado o categoría, y da seguimiento a los fallos.
              </p>
            </div>
          </div>
          <Link
            href="/licitaciones"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <span>Ir a Licitaciones</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
