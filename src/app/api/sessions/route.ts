import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";

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

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");

    const [userRows] = await pool.query<RowDataPacket[]>(
      "SELECT is_aluno, is_mentor FROM Usuario WHERE usuario_id = ?",
      [payload.userId]
    );

    if (userRows.length === 0) {
      return Response.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const user = userRows[0];

    let query = "";
    let params: (string | number)[] = [];

    if (user.is_mentor && !user.is_aluno) {
      query = `
        SELECT s.sessao_id, s.titulo, s.area, s.data_hora, s.duracao_min,
               s.status, s.status_reserva, s.plataforma_video, s.link_reuniao,
               s.joined_aluno_at, s.joined_mentor_at, s.criado_em,
               u.nome AS aluno_nome, u.email AS aluno_email,
               s.aluno_id, s.mentor_id
        FROM Sessao s
        JOIN Aluno a ON a.aluno_id = s.aluno_id
        JOIN Usuario u ON u.usuario_id = a.usuario_id
        WHERE s.mentor_id = (SELECT mentor_id FROM Mentor WHERE usuario_id = ?)
      `;
      params = [payload.userId];
    } else {
      query = `
        SELECT s.sessao_id, s.titulo, s.area, s.data_hora, s.duracao_min,
               s.status, s.status_reserva, s.plataforma_video, s.link_reuniao,
               s.joined_aluno_at, s.joined_mentor_at, s.criado_em,
               u.nome AS mentor_nome, u.email AS mentor_email,
               t.cargo AS mentor_cargo, t.empresa AS mentor_empresa,
               s.aluno_id, s.mentor_id
        FROM Sessao s
        JOIN Mentor t ON t.mentor_id = s.mentor_id
        JOIN Usuario u ON u.usuario_id = t.usuario_id
        WHERE s.aluno_id = (SELECT aluno_id FROM Aluno WHERE usuario_id = ?)
      `;
      params = [payload.userId];
    }

    if (statusFilter && statusFilter !== "all") {
      if (["pendente", "aprovada", "recusada"].includes(statusFilter)) {
        query += " AND s.status_reserva = ?";
        params.push(statusFilter);
      } else if (["agendada", "em_andamento", "concluida", "cancelada"].includes(statusFilter)) {
        query += " AND s.status = ?";
        params.push(statusFilter);
      }
    }

    query += " ORDER BY s.data_hora ASC";

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    return Response.json({ sessions: rows });
  } catch (error) {
    console.error("Sessions GET error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const { mentor_id, titulo, area, data_hora, duracao_min, plataforma_video } = body as {
      mentor_id: number;
      titulo: string;
      area: string;
      data_hora: string;
      duracao_min?: number;
      plataforma_video?: string;
    };

    if (!mentor_id || !titulo || !area || !data_hora) {
      return Response.json(
        { error: "Campos obrigatórios: mentor_id, titulo, area, data_hora" },
        { status: 400 }
      );
    }

    const sessionDate = new Date(data_hora);
    const now = new Date();
    const diffMs = sessionDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return Response.json(
        { error: "O agendamento deve ter no mínimo 24 horas de antecedência" },
        { status: 400 }
      );
    }

    const [alunoRows] = await pool.query<RowDataPacket[]>(
      "SELECT aluno_id FROM Aluno WHERE usuario_id = ?",
      [payload.userId]
    );

    if (alunoRows.length === 0) {
      return Response.json(
        { error: "Usuário não é aluno" },
        { status: 403 }
      );
    }

    const alunoId = alunoRows[0].aluno_id;

    const [MentorRows] = await pool.query<RowDataPacket[]>(
      "SELECT mentor_id, preco_por_sessao FROM Mentor WHERE mentor_id = ?",
      [mentor_id]
    );

    if (MentorRows.length === 0) {
      return Response.json(
        { error: "Mentor não encontrado" },
        { status: 404 }
      );
    }

    const dayOfWeek = sessionDate.getDay();
    const hours = String(sessionDate.getHours()).padStart(2, "0");
    const minutes = String(sessionDate.getMinutes()).padStart(2, "0");
    const timeStr = `${hours}:${minutes}:00`;

    const [availRows] = await pool.query<RowDataPacket[]>(
      `SELECT disponibilidade_id FROM Disponibilidade
       WHERE mentor_id = ? AND dia_semana = ? AND hora_inicio <= ? AND hora_fim > ? AND ativo = 1`,
      [mentor_id, dayOfWeek, timeStr, timeStr]
    );

    if (availRows.length === 0) {
      return Response.json(
        { error: "Mentor não disponível neste horário" },
        { status: 400 }
      );
    }

    const [existingSessions] = await pool.query<RowDataPacket[]>(
      `SELECT sessao_id FROM Sessao
       WHERE mentor_id = ? AND data_hora = ? AND status NOT IN ('cancelada')
       AND status_reserva != 'recusada'`,
      [mentor_id, data_hora]
    );

    if (existingSessions.length > 0) {
      return Response.json(
        { error: "Mentor já possui sessão agendada neste horário" },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO Sessao (aluno_id, mentor_id, titulo, area, data_hora, duracao_min, status, status_reserva, plataforma_video)
       VALUES (?, ?, ?, ?, ?, ?, 'agendada', 'pendente', ?)`,
      [
        alunoId,
        mentor_id,
        titulo,
        area,
        data_hora,
        duracao_min || 60,
        plataforma_video || null,
      ]
    );

    const sessaoId = result.insertId;

    await pool.query<ResultSetHeader>(
      `INSERT INTO Pagamento (sessao_id, valor, forma_pagamento, status)
       VALUES (?, ?, 'pix', 'pendente')`,
      [sessaoId, MentorRows[0].preco_por_sessao]
    );

    return Response.json(
      {
        message: "Sessão agendada com sucesso",
        sessao_id: sessaoId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sessions POST error:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
