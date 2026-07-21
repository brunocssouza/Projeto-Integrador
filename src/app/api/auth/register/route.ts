import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface UserRow extends RowDataPacket {
  usuario_id: number;
  email: string;
  cpf: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, cpf, name, phone, password, role, languages } = body;

    if (!email || !cpf || !name || !phone || !password || !role) {
      return Response.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    if (!Array.isArray(languages) || languages.length === 0) {
      return Response.json(
        { error: "Selecione pelo menos um idioma" },
        { status: 400 }
      );
    }

    const [existing] = await pool.query<UserRow[]>(
      "SELECT usuario_id FROM Usuario WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return Response.json(
        { error: "Este email já está cadastrado" },
        { status: 409 }
      );
    }

    const [existingCpf] = await pool.query<UserRow[]>(
      "SELECT usuario_id FROM Usuario WHERE cpf = ?",
      [cpf]
    );
    if (existingCpf.length > 0) {
      return Response.json(
        { error: "Este CPF já está cadastrado" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const isAluno = role === "aluno" || role === "ambos" ? 1 : 0;
    const isTutor = role === "tutor" || role === "ambos" ? 1 : 0;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO Usuario (cpf, nome, email, telefone, senha_hash, is_aluno, is_tutor, perfil_mentor_completo)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [cpf, name, email, phone, hashedPassword, isAluno, isTutor]
    );

    const userId = result.insertId;

    if (isAluno) {
      await pool.query<ResultSetHeader>(
        "INSERT INTO Aluno (usuario_id) VALUES (?)",
        [userId]
      );
    }

    const langMap: Record<string, number> = {
      PT: 1, EN: 2, ES: 3, FR: 4, DE: 5, IT: 6, JA: 7, ZH: 8,
    };
    for (const sigla of languages) {
      const idiomaId = langMap[sigla];
      if (idiomaId) {
        await pool.query<ResultSetHeader>(
          "INSERT IGNORE INTO Usuario_Idioma (usuario_id, idioma_id) VALUES (?, ?)",
          [userId, idiomaId]
        );
      }
    }

    return Response.json(
      { message: "Conta criada com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
