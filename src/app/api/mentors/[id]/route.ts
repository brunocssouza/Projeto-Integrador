import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

interface MentorRow extends RowDataPacket {
  mentor_id: number;
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

    const [rows] = await pool.query<MentorRow[]>(
      `SELECT t.*, u.nome, u.email, u.avatar_url
       FROM Mentor t
       JOIN Usuario u ON u.usuario_id = t.usuario_id
       WHERE t.mentor_id = ?`,
      [mentorId]
    );

    if (rows.length === 0) {
      return Response.json({ error: "Mentor não encontrado" }, { status: 404 });
    }

    const row = rows[0];

    const [techs] = await pool.query<RowDataPacket[]>(
      `SELECT te.nome FROM Mentor_Tecnologia tt
       JOIN Tecnologia te ON te.tecnologia_id = tt.tecnologia_id
       WHERE tt.mentor_id = ?`,
      [mentorId]
    );

    const [langs] = await pool.query<RowDataPacket[]>(
      `SELECT i.sigla, i.nome FROM Mentor_Idioma ti
       JOIN Idioma i ON i.idioma_id = ti.idioma_id
       WHERE ti.mentor_id = ?`,
      [mentorId]
    );

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

    const [availability] = await pool.query<RowDataPacket[]>(
      `SELECT disponibilidade_id, dia_semana, hora_inicio, hora_fim, ativo, plataformas_video
       FROM Disponibilidade
       WHERE mentor_id = ?
       ORDER BY dia_semana, hora_inicio`,
      [mentorId]
    );

    return Response.json({
      mentor: {
        id: row.mentor_id,
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
