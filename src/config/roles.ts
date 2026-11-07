import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Package,
  FileCheck,
  Building2,
  Users,
  Settings,
  LucideIcon,
} from 'lucide-react';
import { UserData } from '@/domain/auth/types/auth.types';

export type UserRole =
  | 'admin'
  | 'licitaciones'
  | 'licitador'
  | 'comprador'
  | 'evaluador'
  | 'proveedor'
  | 'inactivo'
  | 'user';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
  badge?: string;
}

/**
 * Roles que tienen módulos activos dentro de la plataforma
 */
export const ACTIVE_SYSTEM_ROLES: UserRole[] = [
  'admin',
  'licitaciones',
  'licitador',
  'comprador',
  'evaluador',
  'proveedor',
];

/**
 * Rutas por defecto / destino inicial para cada rol al iniciar sesión
 */
export const ROLE_DEFAULT_ROUTES: Record<string, string> = {
  admin: '/',
  licitaciones: '/licitaciones',
  licitador: '/licitaciones',
  comprador: '/licitaciones',
  evaluador: '/evaluacion',
  proveedor: '/proveedor',
  inactivo: '/sin-acceso',
  user: '/licitaciones',
};

/**
 * Mapeo de rutas protegidas y los roles permitidos en cada una
 */
export const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  '/': ['admin'],
  '/licitaciones': ['admin', 'licitaciones', 'licitador', 'comprador', 'evaluador'],
  '/licitaciones/proyectos': ['admin', 'licitaciones', 'licitador'],
  '/licitaciones/tableros': ['admin', 'licitaciones', 'licitador'],
  '/licitaciones/productos': ['admin', 'licitaciones', 'licitador'],
  '/evaluacion': ['admin', 'evaluador', 'licitaciones'],
  '/proveedor': ['admin', 'proveedor'],
  '/admin/usuarios': ['admin'],
  '/admin/configuracion': ['admin'],
  '/sin-acceso': [
    'admin',
    'licitaciones',
    'licitador',
    'comprador',
    'evaluador',
    'proveedor',
    'inactivo',
    'user',
  ],
};

/**
 * Elementos del menú del Sidebar segmentados por roles
 * Para el rol "licitaciones", incluye exactamente las 4 secciones de crm-jobs
 */
export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  // Menú exclusivo de Administrador
  {
    label: 'Dashboard General',
    href: '/',
    icon: LayoutDashboard,
    roles: ['admin'],
  },

  // Las 4 secciones oficiales del rol Licitaciones (de crm-jobs)
  {
    label: 'Dashboard',
    href: '/licitaciones',
    icon: LayoutDashboard,
    roles: ['admin', 'licitaciones', 'licitador', 'comprador', 'evaluador'],
  },
  {
    label: 'Proyectos',
    href: '/licitaciones/proyectos',
    icon: FolderKanban,
    roles: ['admin', 'licitaciones', 'licitador'],
  },
  {
    label: 'Panel de Actividades',
    href: '/licitaciones/tableros',
    icon: ClipboardList,
    roles: ['admin', 'licitaciones', 'licitador'],
  },
  {
    label: 'Productos',
    href: '/licitaciones/productos',
    icon: Package,
    roles: ['admin', 'licitaciones', 'licitador'],
  },

  // Módulos complementarios para otros roles
  {
    label: 'Dictámenes y Evaluación',
    href: '/evaluacion',
    icon: FileCheck,
    roles: ['admin', 'evaluador'],
  },
  {
    label: 'Portal Proveedores',
    href: '/proveedor',
    icon: Building2,
    roles: ['admin', 'proveedor'],
  },
  {
    label: 'Usuarios y Accesos',
    href: '/admin/usuarios',
    icon: Users,
    roles: ['admin'],
  },
  {
    label: 'Configuración',
    href: '/admin/configuracion',
    icon: Settings,
    roles: ['admin'],
  },
];

/**
 * Helper para extraer y normalizar el rol del usuario desde los datos o JWT
 */
export function extractUserRole(user: UserData | null, tokenSession?: string | null): UserRole {
  if (!user && !tokenSession) return 'user';

  let rawRole: string = (
    user?.roleId ||
    user?.role ||
    user?.rol ||
    user?.roleName ||
    user?.perfil ||
    user?.type ||
    ''
  ).toLowerCase();

  if (!rawRole && tokenSession) {
    try {
      const parts = tokenSession.split('.');
      if (parts.length === 3) {
        const jsonPayload =
          typeof window !== 'undefined'
            ? atob(parts[1])
            : Buffer.from(parts[1], 'base64').toString('utf-8');
        const parsed = JSON.parse(jsonPayload);
        rawRole = (
          parsed.roleId ||
          parsed.role ||
          parsed.rol ||
          parsed.roleName ||
          parsed.perfil ||
          ''
        ).toLowerCase();
      }
    } catch {
      // Ignorar error de decodificación
    }
  }

  // Normalización
  if (rawRole.includes('admin')) return 'admin';
  if (rawRole.includes('licita')) return 'licitaciones';
  if (rawRole.includes('compra')) return 'comprador';
  if (rawRole.includes('evalua')) return 'evaluador';
  if (rawRole.includes('provee')) return 'proveedor';

  if (rawRole && !ACTIVE_SYSTEM_ROLES.includes(rawRole as UserRole)) {
    return 'inactivo';
  }

  return (rawRole as UserRole) || 'licitaciones';
}

export function isRoleActiveInSystem(role: string): boolean {
  return ACTIVE_SYSTEM_ROLES.includes(role as UserRole);
}

export function isRouteAllowedForRole(pathname: string, role: UserRole): boolean {
  if (pathname === '/sin-acceso') return true;

  const matchingRoute = Object.keys(PROTECTED_ROUTES).find(
    (route) => pathname === route || (route !== '/' && pathname.startsWith(route))
  );

  if (!matchingRoute) {
    return true;
  }

  const allowedRoles = PROTECTED_ROUTES[matchingRoute];
  return allowedRoles.includes(role);
}
