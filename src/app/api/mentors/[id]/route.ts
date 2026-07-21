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
  experiencia_profissional: string | null;
  preco_por_sessao: number;
  rating: number;
  total_avaliacoes: number;
  avatar_url: string | null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tutorId = Number(id);

    const [rows] = await pool.query<MentorRow[]>(
      `SELECT t.*, u.nome, u.email, u.avatar_url
       FROM Tutor t
       JOIN Usuario u ON u.usuario_id = t.usuario_id
       WHERE t.tutor_id = ?`,
      [tutorId]
    );

    if (rows.length === 0) {
      return Response.json({ error: "Mentor não encontrado" }, { status: 404 });
    }

    const row = rows[0];

    const [techs] = await pool.query<RowDataPacket[]>(
      `SELECT te.nome FROM Tutor_Tecnologia tt
       JOIN Tecnologia te ON te.tecnologia_id = tt.tecnologia_id
       WHERE tt.tutor_id = ?`,
      [tutorId]
    );

    const [langs] = await pool.query<RowDataPacket[]>(
      `SELECT i.sigla, i.nome FROM Tutor_Idioma ti
       JOIN Idioma i ON i.idioma_id = ti.idioma_id
       WHERE ti.tutor_id = ?`,
      [tutorId]
    );

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

    const [availability] = await pool.query<RowDataPacket[]>(
      `SELECT disponibilidade_id, dia_semana, hora_inicio, hora_fim, ativo, plataformas_video
       FROM Disponibilidade
       WHERE tutor_id = ?
       ORDER BY dia_semana, hora_inicio`,
      [tutorId]
    );

    return Response.json({
      mentor: {
        id: row.tutor_id,
        name: row.nome,
        email: row.email,
        role: row.cargo,
        company: row.empresa,
        description: row.descricao,
        experience: row.experiencia_profissional,
        price: Number(row.preco_por_sessao),
        rating: reviews.length > 0
          ? Number((reviews.reduce((sum: number, r: RowDataPacket) => sum + Number(r.nota), 0) / reviews.length).toFixed(1))
          : 0,
        totalReviews: reviews.length,
        avatar_url: row.avatar_url,
        technologies: techs.map((t: RowDataPacket) => t.nome),
        languages: langs.map((l: RowDataPacket) => ({
          sigla: l.sigla,
          name: l.nome,
        })),
        reviews: reviews.map((r: RowDataPacket) => ({
          id: r.avaliacao_id,
          rating: Number(r.nota),
          title: r.titulo,
          comment: r.comentario,
          date: r.criado_em,
          studentName: r.aluno_nome,
        })),
        availability: availability.map((a: RowDataPacket) => ({
          id: a.disponibilidade_id,
          dayOfWeek: a.dia_semana,
          startTime: a.hora_inicio,
          endTime: a.hora_fim,
          active: a.ativo === 1,
          plataformasVideo: a.plataformas_video
            ? a.plataformas_video.split(",")
            : [],
        })),
      },
    });
  } catch (error) {
    console.error("Mentor profile error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
