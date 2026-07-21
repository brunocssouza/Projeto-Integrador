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

    const [tutorRows] = await pool.query<RowDataPacket[]>(
      "SELECT tutor_id, cargo, empresa, preco_por_sessao, video_apresentacao_url FROM Tutor WHERE usuario_id = ?",
      [payload.userId]
    );

    if (tutorRows.length === 0) {
      return Response.json({ error: "Não é tutor" }, { status: 403 });
    }

    const tutorId = tutorRows[0].tutor_id;

    const [statRows] = await pool.query<RowDataPacket[]>(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) AS concluidas,
         COALESCE((SELECT AVG(nota) FROM Avaliacao_Tutor WHERE tutor_id = ?), 0) AS rating,
         (SELECT COUNT(*) FROM Avaliacao_Tutor WHERE tutor_id = ?) AS reviewCount
       FROM Sessao WHERE tutor_id = ?`,
      [tutorId, tutorId, tutorId]
    );

    const stats = statRows[0] || {};

    return Response.json({
      profile: {
        cargo: tutorRows[0].cargo,
        empresa: tutorRows[0].empresa,
        precoPorSessao: Number(tutorRows[0].preco_por_sessao),
        videoApresentacaoUrl: tutorRows[0].video_apresentacao_url,
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
