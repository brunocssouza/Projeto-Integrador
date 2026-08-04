import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { requireAdmin, listAllMentors } from "@/models/Admin";
import { AppError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    await requireAdmin(payload.userId);
    const mentors = await listAllMentors();
    return Response.json({ mentors });
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json({ error: error.message }, { status: error.httpStatus });
    }
    console.error("Admin mentors error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
