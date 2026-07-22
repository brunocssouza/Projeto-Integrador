import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { hash } from "bcryptjs";

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Token inválido" }, { status: 401 });
    }

    const { senhaAtual, novaSenha } = await request.json();

    if (!senhaAtual || !novaSenha) {
      return Response.json(
        { error: "Senha atual e nova senha são obrigatórias" },
        { status: 400 }
      );
    }

    if (novaSenha.length < 6) {
      return Response.json(
        { error: "Nova senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    const { compare } = await import("bcryptjs");
    const [rows]: any = await pool.query(
      "SELECT senha_hash FROM Usuario WHERE usuario_id = ?",
      [payload.userId]
    );

    if (rows.length === 0) {
      return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const valid = await compare(senhaAtual, rows[0].senha_hash);
    if (!valid) {
      return Response.json({ error: "Senha atual incorreta" }, { status: 400 });
    }

    const novaHash = await hash(novaSenha, 12);

    await pool.query("UPDATE Usuario SET senha_hash = ? WHERE usuario_id = ?", [
      novaHash,
      payload.userId,
    ]);

    return Response.json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("Password change error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
