import pool from "@/infra/database";
import { RowDataPacket } from "mysql2";

export async function get(studentId: number): Promise<{
  nextSession: any;
  stats: { totalSessoes: number; concluidas: number; horasPratica: number };
  recentSessions: any[];
  mentors: any[];
}> {
  const [nextSessao] = await pool.query<RowDataPacket[]>(
    `SELECT s.id, s.title, s.area, s.scheduled_at, s.duration_min,
            s.video_platform, u.name AS mentor_name, t.title AS mentor_role
     FROM session s
     JOIN mentor t ON t.id = s.mentor_id
     JOIN \`user\` u ON u.id = t.user_id
     WHERE s.student_id = ? AND s.scheduled_at > NOW() AND s.status NOT IN ('cancelled')
     ORDER BY s.scheduled_at ASC LIMIT 1`,
    [studentId]
  );

  const [statRows] = await pool.query<RowDataPacket[]>(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS concluidas,
       COALESCE(SUM(CASE WHEN status = 'completed' THEN duration_min ELSE 0 END), 0) AS total_minutos
     FROM session WHERE student_id = ?`,
    [studentId]
  );

  const [recentRows] = await pool.query<RowDataPacket[]>(
    `SELECT s.titulo, s.data_hora, s.status, u.nome AS mentor_nome
     FROM Sessao s
     JOIN Mentor t ON t.mentor_id = s.mentor_id
     JOIN Usuario u ON u.usuario_id = t.usuario_id
     WHERE s.aluno_id = ? AND s.status IN ('concluida', 'em_andamento', 'agendada')
     ORDER BY s.data_hora DESC LIMIT 5`,
    [studentId]
  );

  const [mentorList] = await pool.query<RowDataPacket[]>(
    `SELECT t.mentor_id, u.nome, t.cargo, t.empresa, t.preco_por_sessao,
            COALESCE((SELECT AVG(nota) FROM Avaliacao_Mentor WHERE mentor_id = t.mentor_id), 0) AS rating
     FROM Mentor t
     JOIN Usuario u ON u.usuario_id = t.usuario_id
     ORDER BY rating DESC LIMIT 3`
  );

  const mentorsWithTechs = await Promise.all(
    mentorList.map(async (m: RowDataPacket) => {
      const [techs] = await pool.query<RowDataPacket[]>(
        `SELECT te.nome FROM Mentor_Tecnologia tt
         JOIN Tecnologia te ON te.tecnologia_id = tt.tecnologia_id
         WHERE tt.mentor_id = ?`,
        [m.mentor_id]
      );
      return {
        id: m.mentor_id,
        name: m.nome,
        role: m.cargo,
        company: m.empresa,
        rating: Number(Number(m.rating).toFixed(1)),
        price: Number(m.preco_por_sessao),
        tags: techs.map((t: RowDataPacket) => t.nome),
      };
    })
  );

  const stats = statRows[0] || {};
  const totalMin = Number(stats.total_minutos || 0);

  return {
    nextSession:
      nextSessao.length > 0
        ? {
            id: nextSessao[0].sessao_id,
            title: nextSessao[0].titulo,
            area: nextSessao[0].area,
            dateTime: nextSessao[0].data_hora,
            duration: nextSessao[0].duracao_min,
            platform: nextSessao[0].plataforma_video,
            mentorName: nextSessao[0].mentor_nome,
            mentorRole: nextSessao[0].mentor_role,
          }
        : null,
    stats: {
      totalSessoes: Number(stats.total || 0),
      concluidas: Number(stats.concluidas || 0),
      horasPratica: Math.round(totalMin / 60),
    },
    recentSessions: recentRows.map((r: RowDataPacket) => ({
      title: r.titulo,
      dateTime: r.data_hora,
      status: r.status,
      mentorName: r.mentor_nome,
    })),
    mentors: mentorsWithTechs,
  };
}
