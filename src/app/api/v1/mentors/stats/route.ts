import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { findByUserId, getStats } from "@/models/Mentor";

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    const mentor = await findByUserId(payload.userId);

    if (!mentor) {
      return Response.json({ error: "Não é Mentor" }, { status: 403 });
    }

    const stats = await getStats(mentor.mentor_id);

    return Response.json({
      profile: {
        cargo: mentor.cargo,
        empresa: mentor.empresa,
        descricao: mentor.descricao,
        experiencia: mentor.experiencia_profissional,
        precoPorSessao: Number(mentor.preco_por_sessao),
        videoApresentacaoUrl: mentor.video_apresentacao_url,
      },
      stats,
      canRecordVideo: stats.concluidas >= 20,
    });
  } catch (error) {
    console.error("Mentor stats error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
