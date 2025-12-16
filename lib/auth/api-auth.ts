import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserRole, UserRole } from "./roles";

/**
 * Authenticate API request and return user info
 */
export async function authenticateRequest() {
  const { userId } = await auth();
  
  if (!userId) {
    return {
      error: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
      userId: null,
      role: null,
    };
  }

  const role = await getUserRole();
  
  return {
    error: null,
    userId,
    role,
  };
}

/**
 * Check if user has required role for API route
 */
export async function requireRole(
  requiredRoles: UserRole[]
): Promise<{ error: NextResponse | null; userId: string | null; role: UserRole | null }> {
  const authResult = await authenticateRequest();
  
  if (authResult.error) {
    return authResult;
  }

  if (!authResult.role || !requiredRoles.includes(authResult.role)) {
    return {
      error: NextResponse.json(
        { success: false, error: "Forbidden: Insufficient permissions" },
        { status: 403 }
      ),
      userId: authResult.userId,
      role: authResult.role,
    };
  }

  return {
    error: null,
    userId: authResult.userId,
    role: authResult.role,
  };
}

