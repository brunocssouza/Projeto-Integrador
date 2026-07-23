import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { randomUUID } from "crypto";

interface AuditLogParams {
  actorId?: number;
  action: string;
  target: string;
  before?: unknown;
  after?: unknown;
  request?: NextRequest;
}

/**
 * Log an audit entry to the database.
 * Captures IP address and user agent from the request.
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    if (params.request) {
      const forwarded = params.request.headers.get("x-forwarded-for");
      ipAddress = forwarded
        ? forwarded.split(",")[0].trim()
        : (params.request.headers.get("x-real-ip") ?? null);
      userAgent = params.request.headers.get("user-agent") ?? null;
    }

    await prisma.audit_log.create({
      data: {
        id: randomUUID(),
        actor_id: params.actorId ? Number(params.actorId) : null,
        action: params.action,
        target: params.target,
        before: params.before as never,
        after: params.after as never,
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    });
  } catch (error) {
    logger.error("Failed to write audit log", {
      error: error instanceof Error ? error.message : String(error),
      action: params.action,
    });
  }
}

/**
 * Log an activity to the user's activity feed.
 */
export async function logActivity(
  usuarioId: number,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: unknown,
  request?: NextRequest
): Promise<void> {
  try {
    let ipAddress: string | null = null;

    if (request) {
      const forwarded = request.headers.get("x-forwarded-for");
      ipAddress = forwarded ? forwarded.split(",")[0].trim() : null;
    }

    await prisma.activity_log.create({
      data: {
        id: randomUUID(),
        user_id: usuarioId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata: metadata as never,
        ip_address: ipAddress,
      },
    });
  } catch (error) {
    logger.error("Failed to write activity log", {
      error: error instanceof Error ? error.message : String(error),
      action,
    });
  }
}

export default logAudit;
