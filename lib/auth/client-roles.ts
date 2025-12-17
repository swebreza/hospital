'use client'

import { useUser } from '@clerk/nextjs'
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
 * Get user role from Clerk metadata on the client side
 */
export function useClientUserRole(): UserRole | null {
  const { user, isLoaded } = useUser();
  if (!isLoaded || !user) return null;

  const role = user.publicMetadata?.role as UserRole | undefined;
  if (role === 'normal' || role === 'full_access') {
    return role;
  }
  return null;
}

/**
 * Check if user has access to a route (client-side)
 */
export function useHasAccess(route: string): boolean {
  const userRole = useClientUserRole();
  if (!userRole) return false;

  const routeConfig = routeAccess.find((r) => route.startsWith(r.route));
  if (!routeConfig) return false;

  return routeConfig.roles.includes(userRole);
}

/**
 * Check if user has access to a route (client-side) - non-hook version
 */
export function hasAccessClient(route: string, role: UserRole | null): boolean {
  if (!role) return false;

  const routeConfig = routeAccess.find((r) => route.startsWith(r.route));
  if (!routeConfig) return false;

  return routeConfig.roles.includes(role);
}

