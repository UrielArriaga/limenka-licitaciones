import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuth } from '@/domain/auth/hooks/useAuth';
import {
  FileText,
  LogOut,
  User as UserIcon,
  Bell,
  Shield,
  ChevronLeft,
  ChevronRight,
  Menu,
  RefreshCw,
} from 'lucide-react';
import { SIDEBAR_NAV_ITEMS, extractUserRole, UserRole } from '@/config/roles';
import { RoleGuard } from './RoleGuard';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  allowedRoles?: UserRole[];
  onRefresh?: () => Promise<void> | void;
  isRefreshing?: boolean;
}

const roleBadgeColors: Record<string, { bg: string; text: string }> = {
  admin: { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30', text: 'Administrador' },
  licitaciones: { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', text: 'Licitaciones' },
  licitador: { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', text: 'Licitador' },
  comprador: { bg: 'bg-sky-500/20 text-sky-300 border-sky-500/30', text: 'Comprador' },
  evaluador: { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', text: 'Evaluador' },
  proveedor: { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', text: 'Proveedor' },
  inactivo: { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', text: 'Sin Módulos' },
  user: { bg: 'bg-slate-700 text-slate-300 border-slate-600', text: 'Usuario' },
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  allowedRoles,
  onRefresh,
  isRefreshing,
}) => {
  const router = useRouter();
  const { user, tokenSession, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [internalRefreshing, setInternalRefreshing] = useState(false);

  const currentRole = extractUserRole(user, tokenSession);
  const badgeInfo = roleBadgeColors[currentRole] || roleBadgeColors.user;

  // Filtrar el menú según los roles permitidos
  const visibleNavItems = SIDEBAR_NAV_ITEMS.filter((item) => item.roles.includes(currentRole));

  const refreshing = isRefreshing ?? internalRefreshing;

  const handleRefresh = async () => {
    if (refreshing) return;
    setInternalRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        await router.replace(router.asPath);
      }
    } finally {
      setTimeout(() => setInternalRefreshing(false), 400);
    }
  };

  return (
    <RoleGuard allowedRoles={allowedRoles}>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        {/* Sidebar Desktop */}
        <aside
          className={`hidden md:flex flex-col bg-slate-900 text-slate-200 shrink-0 transition-all duration-300 ease-in-out border-r border-slate-800 ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Brand Header & Toggle */}
          <div
            className={`h-16 flex items-center border-b border-slate-800 ${
              isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <h1 className="font-bold text-white text-base leading-tight truncate">Limenka</h1>
                  <p className="text-[11px] text-slate-400 truncate">Licitaciones</p>
                </div>
              )}
            </div>

            {/* Botón de Colapsar / Expandir */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Expandir menú' : 'Contraer a solo iconos'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Menú de navegación dinámico */}
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
            {!isCollapsed && (
              <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Menú • {badgeInfo.text}
              </div>
            )}

            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center rounded-xl text-sm font-medium transition-all ${
                    isCollapsed
                      ? 'justify-center p-3'
                      : 'gap-3 px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Perfil del Usuario en el pie del Sidebar */}
          {isAuthenticated && user && (
            <div className={`p-3 border-t border-slate-800 ${isCollapsed ? 'flex justify-center' : ''}`}>
              {isCollapsed ? (
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-300"
                    title={`${user.name || user.username} (${badgeInfo.text})`}
                  >
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {user.name || user.username}
                    </p>
                    <span
                      className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeInfo.bg}`}
                    >
                      {badgeInfo.text}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Cabecera Móvil */}
        <header className="md:hidden h-16 bg-slate-900 text-white px-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">Limenka Licitaciones</span>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Menú desplegable Móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{user?.name || user?.username}</span>
              <button onClick={logout} className="text-rose-400 flex items-center gap-1">
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}

        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Barra Superior */}
          <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-slate-800">
                {title || 'Sistema de Licitaciones'}
              </h2>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                title="Actualizar pestaña y datos"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-xs disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-blue-600 transition-transform ${
                    refreshing ? 'animate-spin' : ''
                  }`}
                />
                <span className="hidden sm:inline">Actualizar</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Rol: </span>
                <strong className="text-slate-700 capitalize">{badgeInfo.text}</strong>
              </div>

              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2 right-2 ring-2 ring-white" />
              </button>
            </div>
          </header>

          {/* Área de la página */}
          <main className="flex-1 w-full px-4 sm:px-6 py-4">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
};
