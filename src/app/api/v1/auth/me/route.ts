import { NextRequest } from "next/server";
import pool from "@/infra/database";
import { requireAuth } from "@/infra/auth";
import { findById } from "@/models/User";
import { RowDataPacket } from "mysql2";

export async function GET(request: NextRequest) {
  try {
    const payload = await requireAuth(request);
    const user = await findById(payload.userId);

    if (!user) {
      return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const [langs] = await pool.query<RowDataPacket[]>(
      `SELECT i.sigla FROM Usuario_Idioma ui
       JOIN Idioma i ON i.idioma_id = ui.idioma_id
       WHERE ui.usuario_id = ?`,
      [user.usuario_id]
    );

    return Response.json({
      user: {
        id: user.usuario_id,
        name: user.nome,
        email: user.email,
        phone: user.telefone,
        avatar_url: user.avatar_url,
        is_aluno: user.is_aluno === 1,
        is_mentor: user.is_mentor === 1,
        perfil_mentor_completo: user.perfil_mentor_completo === 1,
        languages: langs.map((l: RowDataPacket) => l.sigla),
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
