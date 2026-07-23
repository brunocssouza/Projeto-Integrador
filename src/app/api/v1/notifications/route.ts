import { NextRequest } from "next/server";
import { validateQuery, withErrorHandler } from "@/lib/validate";
import { requireUser } from "@/lib/auth-guard";
import { notFound } from "@/lib/errors";
import { paginationSchema } from "@/lib/schemas/common";
import * as NotificationModel from "@/models/Notification";
import { findByEmail } from "@/models/User";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const filters = validateQuery(paginationSchema, request);
  const url = new URL(request.url);
  const unreadOnly = url.searchParams.get("unread") === "true";

  const userRow = await findByEmail(user.email);
  if (!userRow) throw notFound("Usuário não encontrado");

  const result = await NotificationModel.listForUser(
    userRow.id,
    filters.page,
    filters.pageSize,
    unreadOnly
  );

  const unreadCount = await NotificationModel.getUnreadCount(userRow.id);

  return Response.json({
    notifications: result.items,
    unreadCount,
    ...filters,
    total: result.total,
  });
});

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const userRow = await findByEmail(user.email);
  if (!userRow) throw notFound("Usuário não encontrado");

  await NotificationModel.markAllRead(userRow.id);

  return Response.json({ success: true });
});
