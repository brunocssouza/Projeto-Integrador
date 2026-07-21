import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ResultSetHeader } from "mysql2";

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

    const body = await request.json();
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (typeof body.nome === "string") {
      updates.push("nome = ?");
      values.push(body.nome);
    }
    if (typeof body.email === "string") {
      updates.push("email = ?");
      values.push(body.email);
    }

    if (updates.length === 0) {
      return Response.json({ error: "Nenhum dado para atualizar" }, { status: 400 });
    }

    values.push(payload.userId);
    await pool.query<ResultSetHeader>(
      `UPDATE Usuario SET ${updates.join(", ")} WHERE usuario_id = ?`,
      values
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Update profile error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
