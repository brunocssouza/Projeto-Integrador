import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { findById as findUserById, findAlunoByUserId } from "@/models/User";
import { get } from "@/models/Dashboard";

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    const user = await findUserById(payload.userId);

    if (!user) {
      return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const alunoId = await findAlunoByUserId(payload.userId);

    if (!alunoId) {
      return Response.json({
        user: { name: user.nome },
        nextSession: null,
        stats: { totalSessoes: 0, concluidas: 0, horasPratica: 0 },
        recentSessions: [],
        mentors: [],
      });
    }

    const data = await get(alunoId);

    return Response.json({
      user: { name: user.nome },
      ...data,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
