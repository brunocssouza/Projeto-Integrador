import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AppError, unauthorized, forbidden } from "@/lib/errors";
import { logger } from "@/lib/logger";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Get the current authenticated user from Better Auth session.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return null;
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: (session.user as unknown as { role?: string }).role ?? "user",
    };
  } catch (error) {
    logger.error("Failed to get current user", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Require authentication. Throws 401 if not authenticated.
 * Works in both route handlers and server components.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw unauthorized();
  }
  return user;
}

/**
 * Require admin role. Throws 403 if not admin.
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw forbidden("Acesso restrito a administradores");
  }
  return user;
}

/**
 * Assert that the current user owns a resource.
 * Throws 403 if not the owner (and not admin).
 */
export async function assertOwnership(
  resourceOwnerId: string | number,
  currentUser?: AuthUser
): Promise<void> {
  const user = currentUser ?? (await requireUser());
  if (user.role === "admin") return;
  if (String(resourceOwnerId) !== String(user.id)) {
    throw forbidden("Você não tem permissão para acessar este recurso");
  }
}

/**
 * Get client IP address from request headers.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

/**
 * Get user agent from request headers.
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get("user-agent") ?? "unknown";
}

export { AppError };
