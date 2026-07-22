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
      return Response.json({ transactions: [], total: 0 });
    }

    const alunoId = alunoRows[0].aluno_id;

    const [sessions] = await pool.query<RowDataPacket[]>(
      `SELECT s.sessao_id, s.titulo, s.area, s.data_hora, s.duracao_min, s.status,
              t.preco_por_sessao AS valor,
              u.nome AS mentor_nome
       FROM Sessao s
       JOIN Mentor t ON t.mentor_id = s.mentor_id
       JOIN Usuario u ON u.usuario_id = t.usuario_id
       WHERE s.aluno_id = ? AND s.status IN ('concluida', 'agendada', 'em_andamento')
       ORDER BY s.data_hora DESC`,
      [alunoId]
    );

    const transactions = sessions.map((s: RowDataPacket) => ({
      id: s.sessao_id,
      title: s.titulo,
      area: s.area,
      MentorName: s.mentor_nome,
      dateTime: s.data_hora,
      duration: s.duracao_min,
      status: s.status,
      valor: Number(s.valor),
    }));

    const total = transactions.reduce((sum, t) => sum + t.valor, 0);

    return Response.json({ transactions, total: Math.round(total * 100) / 100 });
  } catch (error) {
    console.error("Transactions error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
