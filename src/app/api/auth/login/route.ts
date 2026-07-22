import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  usuario_id: number;
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  senha_hash: string;
  avatar_url: string | null;
  is_aluno: number;
  is_mentor: number;
  perfil_mentor_completo: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        { error: "Preencha todos os campos" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<UserRow[]>(
      "SELECT * FROM Usuario WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return Response.json(
        { error: "E-mail ou senha incorretos" },
        { status: 401 }
      );
    }

    const user = rows[0];
    const valid = await comparePassword(password, user.senha_hash);

    if (!valid) {
      return Response.json(
        { error: "E-mail ou senha incorretos" },
        { status: 401 }
      );
    }

    const token = await signToken({
      userId: user.usuario_id,
      email: user.email,
    });

    const response = Response.json({
      user: {
        id: user.usuario_id,
        name: user.nome,
        email: user.email,
        phone: user.telefone,
        avatar_url: user.avatar_url,
        is_aluno: user.is_aluno === 1,
        is_mentor: user.is_mentor === 1,
        perfil_mentor_completo: user.perfil_mentor_completo === 1,
      },
    });

    response.headers.set(
      "Set-Cookie",
      `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
