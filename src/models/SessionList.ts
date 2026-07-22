import pool from "@/infra/database";
import { RowDataPacket } from "mysql2";

export async function listByUser(userId: string, statusFilter?: string | null): Promise<{
  sessions: any[];
  isAluno: boolean;
}> {
  const [userRows] = await pool.query<RowDataPacket[]>(
    "SELECT is_aluno, is_mentor FROM Usuario WHERE usuario_id = ?",
    [userId]
  );

  if (userRows.length === 0) {
    return { sessions: [], isAluno: false };
  }

  const user = userRows[0];
  const isAluno = user.is_aluno === 1;

  let query: string;
  let params: (string | number)[];

  if (user.is_mentor && !user.is_aluno) {
    query = `
      SELECT s.sessao_id, s.titulo, s.area, s.data_hora, s.duracao_min,
             s.status, s.status_reserva, s.plataforma_video, s.link_reuniao,
             s.joined_aluno_at, s.joined_mentor_at, s.criado_em,
             u.nome AS aluno_nome, u.email AS aluno_email,
             s.aluno_id, s.mentor_id
      FROM Sessao s
      JOIN Aluno a ON a.aluno_id = s.aluno_id
      JOIN Usuario u ON u.usuario_id = a.usuario_id
      WHERE s.mentor_id = (SELECT mentor_id FROM Mentor WHERE usuario_id = ?)
    `;
    params = [userId];
  } else {
    query = `
      SELECT s.sessao_id, s.titulo, s.area, s.data_hora, s.duracao_min,
             s.status, s.status_reserva, s.plataforma_video, s.link_reuniao,
             s.joined_aluno_at, s.joined_mentor_at, s.criado_em,
             u.nome AS mentor_nome, u.email AS mentor_email,
             t.cargo AS mentor_cargo, t.empresa AS mentor_empresa,
             s.aluno_id, s.mentor_id
      FROM Sessao s
      JOIN Mentor t ON t.mentor_id = s.mentor_id
      JOIN Usuario u ON u.usuario_id = t.usuario_id
      WHERE s.aluno_id = (SELECT aluno_id FROM Aluno WHERE usuario_id = ?)
    `;
    params = [userId];
  }

  if (statusFilter && statusFilter !== "all") {
    if (["pendente", "aprovada", "recusada"].includes(statusFilter)) {
      query += " AND s.status_reserva = ?";
      params.push(statusFilter);
    } else if (["agendada", "em_andamento", "concluida", "cancelada"].includes(statusFilter)) {
      query += " AND s.status = ?";
      params.push(statusFilter);
    }
  }

  query += " ORDER BY s.data_hora ASC";
  const [rows] = await pool.query<RowDataPacket[]>(query, params);

  return { sessions: rows, isAluno };
}
