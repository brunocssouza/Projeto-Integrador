import pool from "@/infra/database";
import { RowDataPacket } from "mysql2";

interface ReportData {
  stats: { sessoes: number; horas: number; mediaAvaliacao: number };
  skillsProgress: { name: string; progresso: number }[];
  recentActivity: { type: string; description: string; date: string }[];
}

export async function get(alunoId: string): Promise<ReportData> {
  const [statRows] = await pool.query<RowDataPacket[]>(
    `SELECT
       COUNT(*) AS sessoes,
       COALESCE(SUM(duracao_min), 0) AS total_min,
       0 AS media_avaliacao
     FROM Sessao WHERE aluno_id = ? AND status = 'concluida'`,
    [alunoId]
  );

  const s = statRows[0] || {};

  const [sessionRows] = await pool.query<RowDataPacket[]>(
    `SELECT s.sessao_id, s.titulo, s.area, s.data_hora, s.status
     FROM Sessao s
     WHERE s.aluno_id = ? AND s.status IN ('concluida', 'em_andamento')
     ORDER BY s.data_hora DESC LIMIT 5`,
    [alunoId]
  );

  const skillsAreas = sessionRows.reduce<Record<string, number>>((acc, r: RowDataPacket) => {
    if (r.status === "concluida") {
      acc[r.area] = (acc[r.area] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(skillsAreas).reduce((a, b) => a + b, 0) || 1;
  const skillsProgress = Object.entries(skillsAreas).map(([name, count]) => ({
    name,
    progresso: Math.min(Math.round((count / total) * 100), 100),
  }));

  const recentActivity = sessionRows.map((r: RowDataPacket) => ({
    type: r.status === "concluida" ? "session_complete" : "session_pending",
    description: r.titulo,
    date: r.data_hora,
  }));

  return {
    stats: {
      sessoes: Number(s.sessoes || 0),
      horas: Math.round(Number(s.total_min || 0) / 60),
      mediaAvaliacao: Number(s.media_avaliacao || 0),
    },
    skillsProgress,
    recentActivity,
  };
}
