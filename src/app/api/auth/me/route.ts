import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  usuario_id: number;
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  avatar_url: string | null;
  is_aluno: number;
  is_tutor: number;
  perfil_mentor_completo: number;
}

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

    const [rows] = await pool.query<UserRow[]>(
      "SELECT * FROM Usuario WHERE usuario_id = ?",
      [payload.userId]
    );

    if (rows.length === 0) {
      return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const user = rows[0];

    const [langs] = await pool.query<RowDataPacket[]>(
      `SELECT i.sigla FROM Usuario_Idioma ui
       JOIN Idioma i ON i.idioma_id = ui.idioma_id
       WHERE ui.usuario_id = ?`,
      [user.usuario_id]
    );

    return Response.json({
      user: {
        id: user.usuario_id,
        cpf: user.cpf,
        name: user.nome,
        email: user.email,
        phone: user.telefone,
        avatar_url: user.avatar_url,
        is_aluno: user.is_aluno === 1,
        is_tutor: user.is_tutor === 1,
        perfil_mentor_completo: user.perfil_mentor_completo === 1,
        languages: langs.map((l: RowDataPacket) => l.sigla),
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
