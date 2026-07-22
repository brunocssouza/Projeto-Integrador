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
      const [MentorRows] = await conn.query<RowDataPacket[]>(
        "SELECT mentor_id FROM Mentor WHERE usuario_id = ?",
        [userId]
      );

      const alunoId = alunoRows.length > 0 ? alunoRows[0].aluno_id : null;
      const MentorId = MentorRows.length > 0 ? MentorRows[0].mentor_id : null;

      // Delete Mentor dependencies
      if (MentorId) {
        await conn.query("DELETE FROM Pagamento WHERE sessao_id IN (SELECT sessao_id FROM Sessao WHERE mentor_id = ?)", [MentorId]);
        await conn.query("DELETE FROM Avaliacao_Mentor WHERE mentor_id = ?", [MentorId]);
        await conn.query("DELETE FROM Disponibilidade WHERE mentor_id = ?", [MentorId]);
        await conn.query("DELETE FROM Mentor_Tecnologia WHERE mentor_id = ?", [MentorId]);
        await conn.query("DELETE FROM Mentor_Idioma WHERE mentor_id = ?", [MentorId]);
        await conn.query("DELETE FROM Sessao WHERE mentor_id = ?", [MentorId]);
        await conn.query("DELETE FROM Mentor WHERE mentor_id = ?", [MentorId]);
      }

      // Delete aluno dependencies
      if (alunoId) {
        await conn.query("DELETE FROM Pagamento WHERE sessao_id IN (SELECT sessao_id FROM Sessao WHERE aluno_id = ?)", [alunoId]);
        await conn.query("DELETE FROM Avaliacao_Mentor WHERE aluno_id = ?", [alunoId]);
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
