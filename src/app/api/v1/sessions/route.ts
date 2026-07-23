import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { listByUser } from "@/models/SessionList";
import { checkAvailability, create } from "@/models/Session";
import { findStudentByUserId } from "@/models/User";
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

    const { mentor_id, titulo, area, data_hora, duracao_min, plataforma_video } =
      await request.json();
    const mentorId = Number(mentor_id);

    if (!mentorId || !titulo || !area || !data_hora) {
      return Response.json(
        { error: "Campos obrigatórios: mentor_id, titulo, area, data_hora" },
        { status: 400 }
      );
    }

    const avail = await checkAvailability(mentorId, data_hora, duracao_min || 60);
    if (!avail.available) {
      return Response.json({ error: avail.error }, { status: 400 });
    }

    const studentId = await findStudentByUserId(payload.userId);
    if (!studentId) {
      return Response.json({ error: "Usuário não é aluno" }, { status: 403 });
    }

    const mentor = await findMentorById(mentorId);
    if (!mentor) {
      return Response.json({ error: "Mentor não encontrado" }, { status: 404 });
    }

    const sessaoId = await create({
      student_id: studentId,
      mentor_id: mentorId,
      title: titulo,
      area,
      scheduled_at: data_hora,
      duration_min: duracao_min || 60,
      video_platform: plataforma_video || undefined,
      preco: Number(mentor.price_per_session),
    });

    return Response.json(
      { message: "Sessão agendada com sucesso", sessao_id: sessaoId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sessions POST error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
