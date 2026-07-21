import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tutorId = Number(id);

    const [reviews] = await pool.query<RowDataPacket[]>(
      `SELECT a.avaliacao_id, a.nota, a.titulo, a.comentario, a.criado_em,
              u.nome AS aluno_nome
       FROM Avaliacao_Tutor a
       JOIN Aluno al ON al.aluno_id = a.aluno_id
       JOIN Usuario u ON u.usuario_id = al.usuario_id
       WHERE a.tutor_id = ?
       ORDER BY a.criado_em DESC`,
      [tutorId]
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
