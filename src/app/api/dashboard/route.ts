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

    const [userRows] = await pool.query<RowDataPacket[]>(
      "SELECT is_aluno, is_mentor, nome FROM Usuario WHERE usuario_id = ?",
      [payload.userId]
    );

    if (userRows.length === 0) {
      return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const user = userRows[0];

    // Get student ID
    const [alunoRows] = await pool.query<RowDataPacket[]>(
      "SELECT aluno_id FROM Aluno WHERE usuario_id = ?",
      [payload.userId]
    );

    const alunoId = alunoRows.length > 0 ? alunoRows[0].aluno_id : null;

    let nextSession = null;
    let stats = { totalSessoes: 0, concluidas: 0, horasPratica: 0 };
    let recentSessions: RowDataPacket[] = [];

    if (alunoId) {
      // Next upcoming session
      const [nextRows] = await pool.query<RowDataPacket[]>(
        `SELECT s.sessao_id, s.titulo, s.area, s.data_hora, s.duracao_min,
                s.status, s.status_reserva, s.plataforma_video, s.link_reuniao,
                u.nome AS mentor_nome, t.cargo AS mentor_cargo
         FROM Sessao s
         JOIN Mentor t ON t.mentor_id = s.mentor_id
         JOIN Usuario u ON u.usuario_id = t.usuario_id
         WHERE s.aluno_id = ? AND s.status IN ('agendada', 'em_andamento')
         AND s.status_reserva = 'aprovada'
         AND s.data_hora >= NOW()
         ORDER BY s.data_hora ASC
         LIMIT 1`,
        [alunoId]
      );

      if (nextRows.length > 0) {
        nextSession = nextRows[0];
      }

      // Stats
      const [statRows] = await pool.query<RowDataPacket[]>(
        `SELECT
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) AS concluidas,
           COALESCE(SUM(CASE WHEN status = 'concluida' THEN duracao_min ELSE 0 END), 0) AS minutos
         FROM Sessao WHERE aluno_id = ?`,
        [alunoId]
      );

      if (statRows.length > 0) {
        stats = {
          totalSessoes: Number(statRows[0].total || 0),
          concluidas: Number(statRows[0].concluidas || 0),
          horasPratica: Math.round(Number(statRows[0].minutos || 0) / 60 * 10) / 10,
        };
      }

      // Recent sessions
      const [recentRows] = await pool.query<RowDataPacket[]>(
        `SELECT s.sessao_id, s.titulo, s.data_hora, s.status,
                u.nome AS mentor_nome
         FROM Sessao s
         JOIN Mentor t ON t.mentor_id = s.mentor_id
         JOIN Usuario u ON u.usuario_id = t.usuario_id
         WHERE s.aluno_id = ?
         ORDER BY s.data_hora DESC
         LIMIT 5`,
        [alunoId]
      );

      recentSessions = recentRows;
    }

    // Recommended mentors (top rated, not the user themselves)
    const [mentors] = await pool.query<RowDataPacket[]>(
      `SELECT t.mentor_id, u.nome, t.cargo, t.empresa, t.preco_por_sessao,
              COALESCE((SELECT AVG(nota) FROM Avaliacao_Mentor WHERE mentor_id = t.mentor_id), 0) AS rating
       FROM Mentor t
       JOIN Usuario u ON u.usuario_id = t.usuario_id
       WHERE t.usuario_id != ?
       ORDER BY rating DESC
       LIMIT 3`,
      [payload.userId]
    );

    const mentorTechs = await Promise.all(
      mentors.map(async (m: RowDataPacket) => {
        const [techs] = await pool.query<RowDataPacket[]>(
          `SELECT te.nome FROM Mentor_Tecnologia tt
           JOIN Tecnologia te ON te.tecnologia_id = tt.tecnologia_id
           WHERE tt.mentor_id = ? LIMIT 3`,
          [m.mentor_id]
        );
        return {
          id: m.mentor_id,
          name: m.nome,
          role: `${m.cargo}${m.empresa ? ` @ ${m.empresa}` : ""}`,
          tags: techs.map((t: RowDataPacket) => t.nome),
          price: Number(m.preco_por_sessao),
          rating: Number(Number(m.rating).toFixed(1)),
        };
      })
    );

    return Response.json({
      user: { name: user.nome },
      nextSession: nextSession
        ? {
            id: nextSession.sessao_id,
            title: nextSession.titulo,
            area: nextSession.area,
            dateTime: nextSession.data_hora,
            duration: nextSession.duracao_min,
            platform: nextSession.plataforma_video,
            mentorName: nextSession.mentor_nome,
            mentorRole: nextSession.mentor_cargo,
            link: nextSession.link_reuniao,
          }
        : null,
      stats,
      recentSessions: recentSessions.map((s: RowDataPacket) => ({
        id: s.sessao_id,
        title: s.titulo,
        dateTime: s.data_hora,
        status: s.status,
        mentorName: s.mentor_nome,
      })),
      mentors: mentorTechs,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
