import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { requireAdmin, listPendingMentors } from "@/models/Admin";
import { AppError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    await requireAdmin(payload.userId);
    const mentors = await listPendingMentors();
    return Response.json({ mentors });
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json({ error: error.message }, { status: error.httpStatus });
    }
    console.error("Admin pending mentors error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
