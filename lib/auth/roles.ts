import { auth, currentUser } from "@clerk/nextjs/server";

export type UserRole = 'normal' | 'full_access';

export interface RouteAccess {
  route: string;
  roles: UserRole[];
}

// Route access configuration
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
 * Get user role from Clerk metadata
 */
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const user = await currentUser();
    if (!user) return null;
    
    const role = user.publicMetadata?.role as UserRole | undefined;
    if (role === 'normal' || role === 'full_access') {
      return role;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Check if user has access to a route
 */
export async function hasAccess(route: string): Promise<boolean> {
  const role = await getUserRole();
  if (!role) return false;

  const routeConfig = routeAccess.find((r) => route.startsWith(r.route));
  if (!routeConfig) return false;

  return routeConfig.roles.includes(role);
}

/**
 * Get all accessible routes for a user role
 */
export function getAccessibleRoutes(role: UserRole | null): string[] {
  if (!role) return [];
  
  return routeAccess
    .filter((r) => r.roles.includes(role))
    .map((r) => r.route);
}

/**
 * Check if user needs to select a role (first-time login)
 */
export async function needsRoleSelection(): Promise<boolean> {
  const role = await getUserRole();
  return role === null;
}

