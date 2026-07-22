import { NextRequest } from "next/server";
import pool from "@/infra/database";
import { hashPassword } from "@/infra/auth";
import { findByEmail, create } from "@/models/User";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
  try {
    const { email, cpf, name, phone, password, role, languages } = await request.json();

    if (!email || !cpf || !name || !phone || !password || !role) {
      return Response.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
    }

    if (!Array.isArray(languages) || languages.length === 0) {
      return Response.json({ error: "Selecione pelo menos um idioma" }, { status: 400 });
    }

    const existing = await findByEmail(email);
    if (existing) {
      return Response.json({ error: "Este email já está cadastrado" }, { status: 409 });
    }

    const [existingCpf] = await pool.query<RowDataPacket[]>(
      "SELECT usuario_id FROM Usuario WHERE cpf = ?", [cpf]
    );
    if (existingCpf.length > 0) {
      return Response.json({ error: "Este CPF já está cadastrado" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const isAluno = role === "aluno" || role === "ambos" ? 1 : 0;
    const isMentor = role === "mentor" || role === "ambos" ? 1 : 0;

    const userId = await create({ cpf, nome: name, email, telefone: phone, senha_hash: hashedPassword, is_aluno: isAluno, is_mentor: isMentor });

    if (isAluno) {
      await pool.query("INSERT INTO Aluno (usuario_id) VALUES (?)", [userId]);
    }

    const langMap: Record<string, number> = {
      PT: 1, EN: 2, ES: 3, FR: 4, DE: 5, IT: 6, JA: 7, ZH: 8,
    };
    for (const sigla of languages) {
      const idiomaId = langMap[sigla];
      if (idiomaId) {
        await pool.query("INSERT IGNORE INTO Usuario_Idioma (usuario_id, idioma_id) VALUES (?, ?)", [userId, idiomaId]);
      }
    }

    return Response.json({ message: "Conta criada com sucesso" }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
