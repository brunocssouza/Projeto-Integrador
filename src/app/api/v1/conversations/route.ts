import { NextRequest } from "next/server";
import { validateQuery, validateBody, withErrorHandler } from "@/lib/validate";
import { requireUser } from "@/lib/auth-guard";
import { conversationFilterSchema } from "@/lib/schemas/message";
import { listByUser } from "@/models/Conversation";
import { getTotalUnreadForUser } from "@/models/Message";

export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireUser();
  const filters = validateQuery(conversationFilterSchema, request);

  // Get user's numeric ID from email
  const { findByEmail } = await import("@/models/User");
  const userRow = await findByEmail(user.email);
  if (!userRow) {
    return Response.json({ conversations: [], unreadTotal: 0 });
  }

  const result = await listByUser(userRow.id, filters.page, filters.pageSize);
  const unreadTotal = await getTotalUnreadForUser(userRow.id);

  return Response.json({
    conversations: result.items,
    unreadTotal,
    ...filters,
    total: result.total,
  });
});
