import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface MentorRow extends RowDataPacket {
  tutor_id: number;
  usuario_id: number;
  nome: string;
  email: string;
  cargo: string;
  empresa: string | null;
  descricao: string;
  preco_por_sessao: number;
  rating: number;
  total_avaliacoes: number;
  avatar_url: string | null;
}

export async function GET() {
  try {
    const [rows] = await pool.query<MentorRow[]>(
      `SELECT t.tutor_id, t.usuario_id, u.nome, u.email, t.cargo, t.empresa,
              t.descricao, t.preco_por_sessao, u.avatar_url
       FROM Tutor t
       JOIN Usuario u ON u.usuario_id = t.usuario_id
       ORDER BY t.tutor_id`
    );

    const mentors = await Promise.all(
      rows.map(async (row) => {
        const [techs] = await pool.query<RowDataPacket[]>(
          `SELECT te.nome FROM Tutor_Tecnologia tt
           JOIN Tecnologia te ON te.tecnologia_id = tt.tecnologia_id
           WHERE tt.tutor_id = ?`,
          [row.tutor_id]
        );

        const [langs] = await pool.query<RowDataPacket[]>(
          `SELECT i.sigla, i.nome FROM Tutor_Idioma ti
           JOIN Idioma i ON i.idioma_id = ti.idioma_id
           WHERE ti.tutor_id = ?`,
          [row.tutor_id]
        );

        const [ratingRows] = await pool.query<RowDataPacket[]>(
          `SELECT COUNT(*) AS total, COALESCE(AVG(nota), 0) AS media
           FROM Avaliacao_Tutor WHERE tutor_id = ?`,
          [row.tutor_id]
        );

        const totalReviews = Number(ratingRows[0]?.total || 0);
        const avgRating = totalReviews > 0 ? Number(Number(ratingRows[0]?.media).toFixed(1)) : 0;

        return {
          id: row.tutor_id,
          name: row.nome,
          role: row.cargo,
          company: row.empresa,
          rating: avgRating,
          price: Number(row.preco_por_sessao),
          tags: techs.map((t: RowDataPacket) => t.nome),
          languages: langs.map((l: RowDataPacket) => ({ sigla: l.sigla, name: l.nome })),
          description: row.descricao,
          avatar_url: row.avatar_url,
          totalReviews,
        };
      })
    );

    return Response.json({ mentors });
  } catch (error) {
    console.error("Mentors list error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
