import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { listByUser } from "@/models/SessionList";
import { checkAvailability, create } from "@/models/Session";
import { findAlunoByUserId } from "@/models/User";
import { findById as findMentorById } from "@/models/Mentor";

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");

    const result = await listByUser(payload.userId, statusFilter);
    return Response.json({ sessions: result.sessions });
  } catch (error) {
    console.error("Sessions GET error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await requireAuth(request);

    const { mentor_id, titulo, area, data_hora, duracao_min, plataforma_video } = await request.json();

    if (!mentor_id || !titulo || !area || !data_hora) {
      return Response.json({ error: "Campos obrigatórios: mentor_id, titulo, area, data_hora" }, { status: 400 });
    }

    const avail = await checkAvailability(mentor_id, data_hora, duracao_min || 60);
    if (!avail.available) {
      return Response.json({ error: avail.error }, { status: 400 });
    }

    const alunoId = await findAlunoByUserId(payload.userId);
    if (!alunoId) {
      return Response.json({ error: "Usuário não é aluno" }, { status: 403 });
    }

    const mentor = await findMentorById(mentor_id);
    if (!mentor) {
      return Response.json({ error: "Mentor não encontrado" }, { status: 404 });
    }

    const sessaoId = await create({
      aluno_id: alunoId,
      mentor_id,
      titulo,
      area,
      data_hora,
      duracao_min: duracao_min || 60,
      plataforma_video: plataforma_video || undefined,
      preco: Number(mentor.preco_por_sessao),
    });

    return Response.json({ message: "Sessão agendada com sucesso", sessao_id: sessaoId }, { status: 201 });
  } catch (error) {
    console.error("Sessions POST error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
