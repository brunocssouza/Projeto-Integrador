import pool from "@/infra/database";
import { RowDataPacket } from "mysql2";

export async function findByMentorId(mentorId: number): Promise<any[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT a.avaliacao_id, a.nota, a.titulo, a.comentario, a.criado_em,
            u.nome AS aluno_nome
     FROM Avaliacao_Mentor a
     JOIN Aluno al ON al.aluno_id = a.aluno_id
     JOIN Usuario u ON u.usuario_id = al.usuario_id
     WHERE a.mentor_id = ?
     ORDER BY a.criado_em DESC`,
    [mentorId]
  );

  return rows.map((r: RowDataPacket) => ({
    id: r.avaliacao_id,
    rating: Number(r.nota),
    title: r.titulo,
    comment: r.comentario,
    date: r.criado_em,
    studentName: r.aluno_nome,
  }));
}

export async function getStats(mentorId: number): Promise<{ total: number; media: number }> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total, COALESCE(AVG(nota), 0) AS media
     FROM Avaliacao_Mentor WHERE mentor_id = ?`,
    [mentorId]
  );
  return {
    total: Number(rows[0]?.total || 0),
    media: Number(Number(rows[0]?.media || 0).toFixed(1)),
  };
}
