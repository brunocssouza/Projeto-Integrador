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

    const [MentorRows] = await pool.query<RowDataPacket[]>(
      "SELECT mentor_id FROM Mentor WHERE usuario_id = ?",
      [payload.userId]
    );

    if (MentorRows.length === 0) {
      return Response.json({ error: "Não é mentor" }, { status: 403 });
    }

    const MentorId = MentorRows[0].mentor_id;

    const [statRows] = await pool.query<RowDataPacket[]>(
      `SELECT
         COUNT(DISTINCT s.aluno_id) AS alunos_ativos,
         SUM(CASE WHEN s.status = 'concluida' THEN 1 ELSE 0 END) AS sessoes_mes,
         COALESCE((SELECT AVG(nota) FROM Avaliacao_Mentor WHERE mentor_id = ?), 0) AS media
       FROM Sessao s
       WHERE s.mentor_id = ? AND s.status IN ('concluida', 'em_andamento')`,
      [MentorId, MentorId]
    );

    const [alunos] = await pool.query<RowDataPacket[]>(
       `SELECT al.aluno_id, u.nome,
               COUNT(s.sessao_id) AS total_sessoes,
               MAX(s.data_hora) AS ultima_sessao,
               GROUP_CONCAT(DISTINCT s.area SEPARATOR ', ') AS areas
        FROM Aluno al
        JOIN Usuario u ON u.usuario_id = al.usuario_id
        JOIN Sessao s ON s.aluno_id = al.aluno_id
        WHERE s.mentor_id = ? AND s.status = 'concluida'
        GROUP BY al.aluno_id, u.nome
       ORDER BY ultima_sessao DESC`,
      [MentorId]
    );

    const stats = {
      alunosAtivos: alunos.length,
      sessoesMes: Number(statRows[0]?.sessoes_mes || 0),
      mediaAvaliacao: Number(Number(statRows[0]?.media || 0).toFixed(1)),
    };

    const students = alunos.map((a: RowDataPacket) => {
      const name = a.nome as string;
      return {
        id: a.aluno_id,
        name,
        initials: name.split(" ").map((n: string) => n[0]).slice(0, 2).join(""),
        specialty: a.areas || "Geral",
        sessions: Number(a.total_sessoes),
        lastSession: a.ultima_sessao,
      };
    });

    return Response.json({ stats, students });
  } catch (error) {
    console.error("Mentor students error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
