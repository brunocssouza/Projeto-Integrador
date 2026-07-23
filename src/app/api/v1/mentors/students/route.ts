import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { findByUserId, getStudents } from "@/models/Mentor";

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    const mentor = await findByUserId(payload.userId);

    if (!mentor) {
      return Response.json({ error: "Não é mentor" }, { status: 403 });
    }

    const result = await getStudents(mentor.id);

    return Response.json({
      stats: {
        alunosAtivos: result.alunosAtivos,
        sessoesMes: result.sessoesMes,
        mediaAvaliacao: result.mediaAvaliacao,
      },
      students: result.students,
    });
  } catch (error) {
    console.error("Mentor students error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
