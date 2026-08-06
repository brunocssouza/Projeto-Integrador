import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { requireAdmin, listAllSessions } from "@/models/Admin";
import { AppError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    await requireAdmin(payload.userId);
    const sessions = await listAllSessions();
    return Response.json({ sessions });
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json({ error: error.message }, { status: error.httpStatus });
    }
    console.error("Admin sessions error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
