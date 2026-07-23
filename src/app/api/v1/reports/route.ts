import { NextRequest } from "next/server";
import { requireAuth } from "@/infra/auth";
import { findStudentByUserId } from "@/models/User";
import { get } from "@/models/Report";

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    const studentId = await findStudentByUserId(payload.userId);

    if (!studentId) {
      return Response.json({
        stats: { completedSessions: 0, practiceHours: 0, avgRating: 0 },
        skills: [],
        recentActivity: [],
      });
    }

    const report = await get(studentId);

    const skills = [
      { name: "Comunicação", progress: Math.min(40 + report.stats.sessoes * 4, 98) },
      { name: "Resolução de Problemas", progress: Math.min(30 + report.stats.sessoes * 5, 95) },
      { name: "Conhecimento Técnico", progress: Math.min(35 + report.stats.sessoes * 3, 96) },
      { name: "Pensamento Crítico", progress: Math.min(45 + report.stats.sessoes * 3, 94) },
      { name: "Trabalho em Equipe", progress: Math.min(50 + report.stats.sessoes * 2, 97) },
    ];

    const recentActivity =
      report.recentActivity.length > 0
        ? report.recentActivity.map((a: any) => {
            const diffMs = Date.now() - new Date(a.date).getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            let dateLabel = "";
            if (diffDays === 0) dateLabel = "Hoje";
            else if (diffDays === 1) dateLabel = "Ontem";
            else if (diffDays < 7) dateLabel = `Há ${diffDays} dias`;
            else dateLabel = `Há ${Math.floor(diffDays / 7)} semana(s)`;

            return {
              icon: a.type === "session_complete" ? "play_circle" : "calendar_month",
              text:
                a.type === "session_complete"
                  ? `Sessão concluída - ${a.description}`
                  : `Sessão - ${a.description}`,
              date: dateLabel,
            };
          })
        : [
            {
              icon: "info",
              text: "Nenhuma sessão realizada ainda. Explore mentores para começar!",
              date: "",
            },
          ];

    return Response.json({
      stats: {
        completedSessions: report.stats.sessoes,
        practiceHours: report.stats.horas,
        avgRating: report.stats.mediaAvaliacao,
      },
      skills,
      recentActivity,
    });
  } catch (error) {
    console.error("Reports error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
