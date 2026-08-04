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
    `SELECT s.id, s.title, s.scheduled_at, s.status, u.name AS mentor_name
     FROM session s
     JOIN mentor t ON t.id = s.mentor_id
     JOIN \`user\` u ON u.id = t.user_id
     WHERE s.student_id = ? AND s.status IN ('completed', 'in_progress', 'scheduled')
     ORDER BY s.scheduled_at DESC LIMIT 5`,
    [studentId]
  );

  const [mentorList] = await pool.query<RowDataPacket[]>(
    `SELECT t.id AS mentor_id, u.name AS nome, t.title AS cargo, t.company AS empresa,
            t.price_per_session AS preco_por_sessao,
            COALESCE((SELECT AVG(rating) FROM mentor_review WHERE mentor_id = t.id), 0) AS rating
     FROM mentor t
     JOIN \`user\` u ON u.id = t.user_id
     ORDER BY rating DESC LIMIT 3`
  );

  const mentorsWithTechs = await Promise.all(
    mentorList.map(async (m: RowDataPacket) => {
      const [techs] = await pool.query<RowDataPacket[]>(
        `SELECT te.name AS nome FROM mentor_technology tt
         JOIN technology te ON te.id = tt.technology_id
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
            id: nextSessao[0].id,
            title: nextSessao[0].title,
            area: nextSessao[0].area,
            dateTime: nextSessao[0].scheduled_at,
            duration: nextSessao[0].duration_min,
            platform: nextSessao[0].video_platform,
            mentorName: nextSessao[0].mentor_name,
            mentorRole: nextSessao[0].mentor_role,
          }
        : null,
    stats: {
      totalSessoes: Number(stats.total || 0),
      concluidas: Number(stats.concluidas || 0),
      horasPratica: Math.round(totalMin / 60),
    },
    recentSessions: recentRows.map((r: RowDataPacket) => ({
      id: r.id,
      title: r.title,
      dateTime: r.scheduled_at,
      status: r.status,
      mentorName: r.mentor_name,
    })),
    mentors: mentorsWithTechs,
  };
}
