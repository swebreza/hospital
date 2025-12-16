'use client'

import type { ClerkUserRole } from '@/lib/types'

export type UserRole = ClerkUserRole

export interface RouteAccess {
  route: string;
  roles: UserRole[];
}

// Route access configuration (client-side)
export const routeAccess: RouteAccess[] = [
  { route: '/', roles: ['normal', 'full_access'] }, // Dashboard
  { route: '/assets', roles: ['normal', 'full_access'] },
  { route: '/pm', roles: ['normal', 'full_access'] }, // Preventive Maintenance
  { route: '/complaints', roles: ['normal', 'full_access'] }, // Breakdowns
  { route: '/inventory', roles: ['normal', 'full_access'] },
  { route: '/vendors', roles: ['normal', 'full_access'] },
  { route: '/calibration', roles: ['full_access'] },
  { route: '/training', roles: ['full_access'] },
  { route: '/reports', roles: ['full_access'] },
  { route: '/settings', roles: ['full_access'] },
];

/**
 * Check if user has access to a route (client-side)
 */
export function hasAccessClient(route: string, role: UserRole | null): boolean {
  if (!role) return false;

  const routeConfig = routeAccess.find((r) => route.startsWith(r.route));
  if (!routeConfig) return false;

  return routeConfig.roles.includes(role);
}

