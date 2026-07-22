import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { RowDataPacket } from "mysql2";

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

    const [MentorRows] = await pool.query<RowDataPacket[]>(
      "SELECT mentor_id, cargo, empresa, descricao, experiencia_profissional, preco_por_sessao, video_apresentacao_url FROM Mentor WHERE usuario_id = ?",
      [payload.userId]
    );

    if (MentorRows.length === 0) {
      return Response.json({ error: "Não é Mentor" }, { status: 403 });
    }

    const MentorId = MentorRows[0].mentor_id;

    const [statRows] = await pool.query<RowDataPacket[]>(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) AS concluidas,
         COALESCE((SELECT AVG(nota) FROM Avaliacao_Mentor WHERE mentor_id = ?), 0) AS rating,
         (SELECT COUNT(*) FROM Avaliacao_Mentor WHERE mentor_id = ?) AS reviewCount
       FROM Sessao WHERE mentor_id = ?`,
      [MentorId, MentorId, MentorId]
    );

    const stats = statRows[0] || {};

    return Response.json({
      profile: {
        cargo: MentorRows[0].cargo,
        empresa: MentorRows[0].empresa,
        descricao: MentorRows[0].descricao,
        experiencia: MentorRows[0].experiencia_profissional,
        precoPorSessao: Number(MentorRows[0].preco_por_sessao),
        videoApresentacaoUrl: MentorRows[0].video_apresentacao_url,
      },
      stats: {
        total: Number(stats.total || 0),
        concluidas: Number(stats.concluidas || 0),
        rating: Number(Number(stats.rating || 0).toFixed(1)),
        reviewCount: Number(stats.reviewCount || 0),
      },
      canRecordVideo: Number(stats.concluidas || 0) >= 20,
    });
  } catch (error) {
    console.error("Mentor stats error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
