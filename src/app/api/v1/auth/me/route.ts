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
      `SELECT i.code FROM user_language ui
       JOIN language i ON i.id = ui.language_id
       WHERE ui.user_id = ?`,
      [user.id]
    );

    return Response.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        is_aluno: user.is_student === 1,
        is_mentor: user.is_mentor === 1,
        perfil_mentor_completo: user.is_mentor_profile_complete === 1,
        languages: langs.map((l: RowDataPacket) => l.sigla),
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
