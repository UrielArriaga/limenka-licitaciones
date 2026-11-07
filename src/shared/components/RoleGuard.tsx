import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/useAuthStore';
import {
  extractUserRole,
  isRouteAllowedForRole,
  isRoleActiveInSystem,
  ROLE_DEFAULT_ROUTES,
  UserRole,
} from '@/config/roles';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const router = useRouter();
  const { user, tokenSession, isAuthenticated } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // 1. Si no está autenticado y no está en /login, redirigir al login
    if (!isAuthenticated || !user) {
      if (router.pathname !== '/login') {
        router.replace('/login');
      }
      return;
    }

    const currentRole = extractUserRole(user, tokenSession);

    // 2. Si el rol no tiene módulos activos en este sistema, enviarlo a /sin-acceso
    if (currentRole === 'inactivo' && router.pathname !== '/sin-acceso') {
      router.replace('/sin-acceso');
      return;
    }

    // 3. Si un usuario que NO es admin entra a la raíz '/', redirigirlo a su pantalla por defecto
    if (router.pathname === '/' && currentRole !== 'admin') {
      const defaultRoute = ROLE_DEFAULT_ROUTES[currentRole] || '/licitaciones';
      if (defaultRoute !== '/') {
        router.replace(defaultRoute);
        return;
      }
    }

    // 4. Validar si la ruta actual está permitida para su rol
    const routeAllowed = allowedRoles
      ? allowedRoles.includes(currentRole)
      : isRouteAllowedForRole(router.pathname, currentRole);

    if (!routeAllowed) {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [mounted, isAuthenticated, user, tokenSession, router.pathname, router, allowedRoles]);

  if (!mounted || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-sm">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span>Verificando permisos y accesos...</span>
        </div>
      </div>
    );
  }

  // Pantalla 403: Acceso No Autorizado si intenta ingresar por URL a una pantalla no permitida
  if (!isAuthorized) {
    const currentRole = extractUserRole(user, tokenSession);
    const userDefaultHome = ROLE_DEFAULT_ROUTES[currentRole] || '/licitaciones';

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 p-8 rounded-3xl text-center shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-5 border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight">Acceso Denegado</h2>
          <p className="text-slate-300 text-sm mt-2 mb-4 leading-relaxed">
            Tu rol actual (<strong className="text-blue-400 uppercase">{currentRole}</strong>) no
            cuenta con permisos suficientes para acceder a la ruta{' '}
            <code className="text-rose-300 bg-slate-900 px-2 py-0.5 rounded text-xs">
              {router.pathname}
            </code>
            .
          </p>

          <Link
            href={userDefaultHome}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a mi área autorizada ({userDefaultHome})</span>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
