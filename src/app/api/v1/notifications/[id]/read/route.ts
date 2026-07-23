import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/validate";
import { requireUser } from "@/lib/auth-guard";
import { notFound } from "@/lib/errors";
import { markRead } from "@/models/Notification";

export const PATCH = withErrorHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await requireUser();
    const { id } = await params;

    const notification = await markRead(id);
    if (!notification) {
      throw notFound("Notificação não encontrada");
    }

    return Response.json({ success: true });
  }
);
