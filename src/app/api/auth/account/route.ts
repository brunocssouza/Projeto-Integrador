import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Token inválido" }, { status: 401 });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const userId = payload.userId;

      // Get IDs
      const [alunoRows] = await conn.query<RowDataPacket[]>(
        "SELECT aluno_id FROM Aluno WHERE usuario_id = ?",
        [userId]
      );
      const [tutorRows] = await conn.query<RowDataPacket[]>(
        "SELECT tutor_id FROM Tutor WHERE usuario_id = ?",
        [userId]
      );

      const alunoId = alunoRows.length > 0 ? alunoRows[0].aluno_id : null;
      const tutorId = tutorRows.length > 0 ? tutorRows[0].tutor_id : null;

      // Delete tutor dependencies
      if (tutorId) {
        await conn.query("DELETE FROM Avaliacao_Tutor WHERE sessao_id IN (SELECT sessao_id FROM Sessao WHERE tutor_id = ?)", [tutorId]);
        await conn.query("DELETE FROM Sessao WHERE tutor_id = ?", [tutorId]);
        await conn.query("DELETE FROM Disponibilidade WHERE tutor_id = ?", [tutorId]);
        await conn.query("DELETE FROM Tutor_Tecnologia WHERE tutor_id = ?", [tutorId]);
        await conn.query("DELETE FROM Tutor_Idioma WHERE tutor_id = ?", [tutorId]);
        await conn.query("DELETE FROM Tutor WHERE tutor_id = ?", [tutorId]);
      }

      // Delete aluno dependencies
      if (alunoId) {
        await conn.query("DELETE FROM Avaliacao_Tutor WHERE sessao_id IN (SELECT sessao_id FROM Sessao WHERE aluno_id = ?)", [alunoId]);
        await conn.query("DELETE FROM Sessao WHERE aluno_id = ?", [alunoId]);
        await conn.query("DELETE FROM Aluno WHERE aluno_id = ?", [alunoId]);
      }

      // Delete user
      await conn.query("DELETE FROM Usuario WHERE usuario_id = ?", [userId]);

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    const response = Response.json({ success: true });
    response.headers.append(
      "Set-Cookie",
      "token=; Path=/; HttpOnly; Max-Age=0"
    );
    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
