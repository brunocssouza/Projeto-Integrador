import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Token inválido" }, { status: 401 });
    }
    const { id } = await params;
    const mentorId = Number(id);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT disponibilidade_id, dia_semana, hora_inicio, hora_fim, ativo, plataformas_video
       FROM Disponibilidade
       WHERE mentor_id = ?
       ORDER BY dia_semana, hora_inicio`,
      [mentorId]
    );

    return Response.json({
      availability: rows.map((r) => ({
        id: r.disponibilidade_id,
        dayOfWeek: r.dia_semana,
        startTime: r.hora_inicio,
        endTime: r.hora_fim,
        active: r.ativo === 1,
        plataformasVideo: r.plataformas_video
          ? r.plataformas_video.split(",")
          : [],
      })),
    });
  } catch (error) {
    console.error("Disponibilidade GET error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return Response.json({ error: "Não autenticado" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return Response.json({ error: "Token inválido" }, { status: 401 });
    }

    const { id } = await params;
    const mentorId = Number(id);

    const [mentorRows] = await pool.query<RowDataPacket[]>(
      "SELECT mentor_id FROM Mentor WHERE usuario_id = ?",
      [payload.userId]
    );

    if (mentorRows.length === 0 || mentorRows[0].mentor_id !== mentorId) {
      return Response.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { slots } = body as {
      slots: { dayOfWeek: number; startTime: string; endTime: string; plataformasVideo?: string[] }[];
    };

    await pool.query<ResultSetHeader>(
      "DELETE FROM Disponibilidade WHERE mentor_id = ?",
      [mentorId]
    );

    if (slots && slots.length > 0) {
      for (const slot of slots) {
        const platforms = slot.plataformasVideo && slot.plataformasVideo.length > 0
          ? slot.plataformasVideo.join(",")
          : null;
        await pool.query<ResultSetHeader>(
          `INSERT INTO Disponibilidade (mentor_id, dia_semana, hora_inicio, hora_fim, ativo, plataformas_video)
           VALUES (?, ?, ?, ?, 1, ?)`,
          [mentorId, slot.dayOfWeek, slot.startTime, slot.endTime, platforms]
        );
      }
    }

    return Response.json({ message: "Disponibilidade atualizada com sucesso" });
  } catch (error) {
    console.error("Disponibilidade PUT error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
