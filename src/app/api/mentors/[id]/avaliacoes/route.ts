import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Token inválido" }, { status: 401 });
    }
    const { id } = await params;
    const mentorId = Number(id);

    const [reviews] = await pool.query<RowDataPacket[]>(
      `SELECT a.avaliacao_id, a.nota, a.titulo, a.comentario, a.criado_em,
              u.nome AS aluno_nome
       FROM Avaliacao_Mentor a
       JOIN Aluno al ON al.aluno_id = a.aluno_id
       JOIN Usuario u ON u.usuario_id = al.usuario_id
       WHERE a.mentor_id = ?
       ORDER BY a.criado_em DESC`,
      [mentorId]
    );

    return Response.json({
      reviews: reviews.map((r) => ({
        id: r.avaliacao_id,
        rating: Number(r.nota),
        title: r.titulo,
        comment: r.comentario,
        date: r.criado_em,
        studentName: r.aluno_nome,
      })),
    });
  } catch (error) {
    console.error("Avaliacoes error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
