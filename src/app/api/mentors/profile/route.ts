import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { RowDataPacket, ResultSetHeader } from "mysql2";

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

    // Verify user is a tutor
    const [tutorRows] = await pool.query<RowDataPacket[]>(
      "SELECT tutor_id FROM Tutor WHERE usuario_id = ?",
      [payload.userId]
    );

    if (tutorRows.length === 0) {
      return Response.json({ error: "Não é tutor" }, { status: 403 });
    }

    const tutorId = tutorRows[0].tutor_id;

    // Update allowed fields
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (body.cargo !== undefined) {
      updates.push("cargo = ?");
      values.push(body.cargo);
    }
    if (body.empresa !== undefined) {
      updates.push("empresa = ?");
      values.push(body.empresa);
    }
    if (body.precoPorSessao !== undefined) {
      updates.push("preco_por_sessao = ?");
      values.push(body.precoPorSessao);
    }
    if (body.videoApresentacao !== undefined) {
      updates.push("video_apresentacao_url = ?");
      values.push(body.videoApresentacao);
    }

    if (updates.length === 0) {
      return Response.json({ error: "Nenhum dado para atualizar" }, { status: 400 });
    }

    values.push(tutorId);
    await pool.query<ResultSetHeader>(
      `UPDATE Tutor SET ${updates.join(", ")} WHERE tutor_id = ?`,
      values
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Update mentor profile error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
