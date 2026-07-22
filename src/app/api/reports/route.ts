import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Token inválido" }, { status: 401 });
    }

    const [alunoRows] = await pool.query<RowDataPacket[]>(
      "SELECT aluno_id FROM Aluno WHERE usuario_id = ?",
      [payload.userId]
    );

    if (alunoRows.length === 0) {
      return Response.json({
        stats: { completedSessions: 0, practiceHours: 0, avgRating: 0 },
        skills: [],
        recentActivity: [],
      });
    }

    const alunoId = alunoRows[0].aluno_id;

    const [statRows] = await pool.query<RowDataPacket[]>(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) AS concluidas,
         COALESCE(SUM(CASE WHEN status = 'concluida' THEN duracao_min ELSE 0 END), 0) AS minutos,
         COALESCE((SELECT AVG(a.nota) FROM Avaliacao_Mentor a
                    JOIN Sessao s2 ON s2.sessao_id = a.sessao_id
                    WHERE s2.aluno_id = ?), 0) AS media
       FROM Sessao WHERE aluno_id = ?`,
      [alunoId, alunoId]
    );

    const row = statRows[0] || {};
    const stats = {
      completedSessions: Number(row.concluidas || 0),
      practiceHours: Math.round(Number(row.minutos || 0) / 60 * 10) / 10,
      avgRating: Number(Number(row.media || 0).toFixed(1)),
    };

    const skills = [
      { name: "Comunicação", progress: Math.min(40 + stats.completedSessions * 4, 98) },
      { name: "Resolução de Problemas", progress: Math.min(30 + stats.completedSessions * 5, 95) },
      { name: "Conhecimento Técnico", progress: Math.min(35 + stats.completedSessions * 3, 96) },
      { name: "Pensamento Crítico", progress: Math.min(45 + stats.completedSessions * 3, 94) },
      { name: "Trabalho em Equipe", progress: Math.min(50 + stats.completedSessions * 2, 97) },
    ];

    const [recentRows] = await pool.query<RowDataPacket[]>(
      `SELECT s.titulo, s.data_hora, s.status, u.nome AS mentor_nome
       FROM Sessao s
       JOIN Mentor t ON t.mentor_id = s.mentor_id
       JOIN Usuario u ON u.usuario_id = t.usuario_id
       WHERE s.aluno_id = ?
       ORDER BY s.data_hora DESC
       LIMIT 5`,
      [alunoId]
    );

    const recentActivity = recentRows.map((s: RowDataPacket) => {
      const diffMs = Date.now() - new Date(s.data_hora).getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      let dateLabel = "";
      if (diffDays === 0) dateLabel = "Hoje";
      else if (diffDays === 1) dateLabel = "Ontem";
      else if (diffDays < 7) dateLabel = `Há ${diffDays} dias`;
      else dateLabel = `Há ${Math.floor(diffDays / 7)} semana(s)`;

      return {
        icon: s.status === "concluida" ? "play_circle" : "calendar_month",
        text: s.status === "concluida"
          ? `Sessão concluída com ${s.mentor_nome}`
          : `Sessão agendada com ${s.mentor_nome}`,
        date: dateLabel,
      };
    });

    if (recentActivity.length === 0) {
      recentActivity.push({
        icon: "info",
        text: "Nenhuma sessão realizada ainda. Explore mentores para começar!",
        date: "",
      });
    }

    return Response.json({ stats, skills, recentActivity });
  } catch (error) {
    console.error("Reports error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
