import Head from 'next/head';
import { LoginForm } from '@/domain/auth/components/LoginForm';
import {
  FileText,
  ShieldCheck,
  Award,
  Zap,
  TrendingUp,
  Lock,
} from 'lucide-react';

export default function LoginPage() {
  return (
    <>
      <Head>
        <title>Acceso Seguro | Limenka Licitaciones</title>
        <meta
          name="description"
          content="Accede a la plataforma inteligente de licitaciones y contratos de Limenka"
        />
      </Head>

      <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-900 selection:bg-blue-500 selection:text-white">
        {/* PANEL IZQUIERDO: Branding & Propuesta de Valor (Desktop) */}
        <div className="relative hidden lg:flex lg:w-1/2 xl:w-7/12 flex-col justify-between p-12 xl:p-16 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
          {/* Círculos de luz difusa y efectos sutiles de fondo */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Header Superior del Panel */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">
                Limenka
              </span>
              <span className="text-xs font-medium text-blue-300/80 tracking-wide uppercase">
                Sistema de Licitaciones
              </span>
            </div>
          </div>

          {/* Mensaje Central y Highlights */}
          <div className="relative z-10 my-auto py-12 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium mb-6 backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Plataforma de Licitaciones 2026</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.15] text-white">
              Gestión inteligente y transparente de{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                procesos licitatorios
              </span>
            </h1>

            <p className="mt-4 text-base xl:text-lg text-slate-300/90 leading-relaxed font-light">
              Centraliza convocatorias, recepción de pliegos, evaluación de propuestas técnicas y dictámenes en un entorno seguro y auditable.
            </p>

            {/* Tarjetas de Métricas / Features */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
                <div className="flex items-center gap-2 text-blue-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Eficiencia</span>
                </div>
                <p className="text-2xl font-bold text-white">+65%</p>
                <p className="text-xs text-slate-400 mt-0.5">Agilidad en dictámenes y fallos</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Seguridad</span>
                </div>
                <p className="text-2xl font-bold text-white">TLS 1.3</p>
                <p className="text-xs text-slate-400 mt-0.5">Cifrado íntegro de propuestas</p>
              </div>
            </div>
          </div>

          {/* Footer del Panel Izquierdo */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.08] pt-6">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              Cumplimiento normativo y trazabilidad total
            </span>
            <span className="text-slate-500">v1.0.0</span>
          </div>
        </div>

        {/* PANEL DERECHO: Tarjeta de Acceso y Formulario */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-12 xl:px-16 bg-slate-50 text-slate-900">
          <div className="w-full max-w-md">
            {/* Header móvil (solo visible en pantallas pequeñas) */}
            <div className="flex lg:hidden items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base leading-tight block">
                  Limenka Licitaciones
                </span>
                <span className="text-xs text-slate-500">Portal Institucional</span>
              </div>
            </div>

            {/* Encabezado del Formulario */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium mb-3">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span>Acceso Restringido</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Bienvenido de vuelta
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Ingresa tus credenciales para administrar tus procesos y convocatorias
              </p>
            </div>

            {/* Contenedor del Formulario */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80">
              <LoginForm />
            </div>

            {/* Links y pie de página de soporte */}
            <div className="mt-8 text-center text-xs text-slate-500 space-y-2">
              <p>
                ¿Tienes problemas para acceder?{' '}
                <a
                  href="mailto:soporte@limenka.com"
                  className="font-medium text-blue-600 hover:text-blue-700 underline"
                >
                  Contactar a Soporte TI
                </a>
              </p>
              <div className="flex items-center justify-center gap-4 text-slate-400 pt-2">
                <span>Aviso de Privacidad</span>
                <span>•</span>
                <span>Términos de Servicio</span>
                <span>•</span>
                <span>Limenka © 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
