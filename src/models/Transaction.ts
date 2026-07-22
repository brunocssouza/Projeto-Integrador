import pool from "@/infra/database";
import { RowDataPacket } from "mysql2";

export async function getByAlunoId(alunoId: number): Promise<{
  transactions: any[];
  total: number;
}> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.pagamento_id, p.valor, p.status AS pagamento_status,
            s.titulo, s.area, s.data_hora, s.duracao_min, s.status AS sessao_status,
            u.nome AS mentor_nome
     FROM Pagamento p
     JOIN Sessao s ON s.sessao_id = p.sessao_id
     JOIN Mentor t ON t.mentor_id = s.mentor_id
     JOIN Usuario u ON u.usuario_id = t.usuario_id
     WHERE s.aluno_id = ?
     ORDER BY s.data_hora DESC`,
    [alunoId]
  );

  const total = rows.reduce((sum, r: RowDataPacket) => sum + Number(r.valor || 0), 0);

  return {
    transactions: rows.map((r: RowDataPacket) => ({
      id: r.pagamento_id,
      title: r.titulo,
      area: r.area,
      mentorName: r.mentor_nome,
      dateTime: r.data_hora,
      duration: r.duracao_min,
      status: r.sessao_status,
      valor: Number(r.valor || 0),
    })),
    total: Number(total.toFixed(2)),
  };
}
