import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { unauthorized } from "@/lib/errors";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
  role: string;
}

export interface Session {
  session: {
    id: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    ipAddress: string | null;
    userAgent: string | null;
  };
  user: SessionUser;
}

/**
 * Get the current session from the request headers.
 * Returns null if not authenticated.
 */
export async function getSession(): Promise<Session | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session as Session | null;
}

/**
 * Require authentication. Throws 401 if not authenticated.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw unauthorized();
  }
  return session;
}

/**
 * Require admin role. Throws 403 if not admin.
 */
export async function requireAdminSession(): Promise<Session> {
  const session = await requireSession();
  if (session.user.role !== "admin") {
    throw unauthorized("Acesso restrito a administradores");
  }
  return session;
}

export default getSession;
