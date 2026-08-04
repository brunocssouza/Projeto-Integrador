import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { requireAdmin, approveMentor, rejectMentor } from "@/models/Admin";
import { AppError } from "@/lib/errors";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const payload = await requireAuth(request);
    await requireAdmin(payload.userId);
    const { id, action } = await params;
    const mentorId = Number(id);

    if (action === "approve") {
      await approveMentor(mentorId);
      return Response.json({ message: "Mentor aprovado com sucesso" });
    }
    if (action === "reject") {
      let reason: string | undefined;
      try {
        const body = await request.json();
        reason = body?.reason;
      } catch {}
      await rejectMentor(mentorId, reason);
      return Response.json({ message: "Mentor recusado" });
    }
    return Response.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json({ error: error.message }, { status: error.httpStatus });
    }
    console.error("Admin mentor action error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
