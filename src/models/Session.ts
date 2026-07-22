import pool from "@/infra/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface SessionRow {
  sessao_id: number;
  aluno_id: number;
  mentor_id: number;
  titulo: string;
  area: string;
  data_hora: string;
  duracao_min: number;
  status: string;
  status_reserva: string;
  plataforma_video: string | null;
  link_reuniao: string | null;
  joined_mentor_at: string | null;
  joined_aluno_at: string | null;
  cancelado_por: number | null;
  motivo_cancelamento: string | null;
}

export interface Ownership {
  isOwner: boolean;
  isMentor: boolean;
  isAluno: boolean;
}

export async function findById(sessaoId: number): Promise<SessionRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM Sessao WHERE sessao_id = ?",
    [sessaoId]
  );
  return rows.length > 0 ? (rows[0] as SessionRow) : null;
}

export async function verifyOwnership(sessaoId: number, userId: number): Promise<Ownership> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       CASE WHEN t.usuario_id = ? THEN 1 ELSE 0 END AS is_mentor_owner,
       CASE WHEN a.usuario_id = ? THEN 1 ELSE 0 END AS is_aluno_owner
     FROM Sessao s
     LEFT JOIN Mentor t ON t.mentor_id = s.mentor_id
     LEFT JOIN Aluno a ON a.aluno_id = s.aluno_id
     WHERE s.sessao_id = ?`,
    [userId, userId, sessaoId]
  );

  if (rows.length === 0) return { isOwner: false, isMentor: false, isAluno: false };

  return {
    isOwner: rows[0].is_mentor_owner === 1 || rows[0].is_aluno_owner === 1,
    isMentor: rows[0].is_mentor_owner === 1,
    isAluno: rows[0].is_aluno_owner === 1,
  };
}

export async function create(data: {
  aluno_id: number;
  mentor_id: number;
  titulo: string;
  area: string;
  data_hora: string;
  duracao_min: number;
  plataforma_video?: string;
  preco: number;
}): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO Sessao (aluno_id, mentor_id, titulo, area, data_hora, duracao_min, status, status_reserva, plataforma_video)
     VALUES (?, ?, ?, ?, ?, ?, 'agendada', 'pendente', ?)`,
    [data.aluno_id, data.mentor_id, data.titulo, data.area, data.data_hora, data.duracao_min, data.plataforma_video || null]
  );

  const sessaoId = result.insertId;

  await pool.query(
    "INSERT INTO Pagamento (sessao_id, valor, forma_pagamento, status) VALUES (?, ?, 'pix', 'pendente')",
    [sessaoId, data.preco]
  );

  return sessaoId;
}

export async function approve(sessaoId: number): Promise<void> {
  await pool.query("UPDATE Sessao SET status_reserva = 'aprovada' WHERE sessao_id = ?", [sessaoId]);
}

export async function decline(sessaoId: number): Promise<void> {
  await pool.query("UPDATE Sessao SET status_reserva = 'recusada' WHERE sessao_id = ?", [sessaoId]);
}

export async function cancel(sessaoId: number, userId: number, motivo?: string): Promise<void> {
  await pool.query(
    `UPDATE Sessao SET status = 'cancelada', cancelado_por = ?, motivo_cancelamento = ? WHERE sessao_id = ?`,
    [userId, motivo || null, sessaoId]
  );
}

export async function updateLink(sessaoId: number, link: string): Promise<void> {
  await pool.query("UPDATE Sessao SET link_reuniao = ? WHERE sessao_id = ?", [link, sessaoId]);
}

export async function start(sessaoId: number): Promise<void> {
  await pool.query("UPDATE Sessao SET status = 'em_andamento' WHERE sessao_id = ?", [sessaoId]);
}

export async function complete(sessaoId: number): Promise<void> {
  await pool.query("UPDATE Sessao SET status = 'concluida' WHERE sessao_id = ?", [sessaoId]);
}

export async function joinAsMentor(sessaoId: number): Promise<void> {
  await pool.query(
    "UPDATE Sessao SET joined_mentor_at = NOW() WHERE sessao_id = ? AND joined_mentor_at IS NULL",
    [sessaoId]
  );
}

export async function joinAsAluno(sessaoId: number): Promise<void> {
  await pool.query(
    "UPDATE Sessao SET joined_aluno_at = NOW() WHERE sessao_id = ? AND joined_aluno_at IS NULL",
    [sessaoId]
  );
}

export async function checkAvailability(
  mentorId: number,
  data_hora: string,
  duracao_min: number
): Promise<{ available: boolean; error?: string }> {
  const sessionDate = new Date(data_hora);
  const now = new Date();
  const diffHours = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffHours < 24) {
    return { available: false, error: "O agendamento deve ter no mínimo 24 horas de antecedência" };
  }

  const dayOfWeek = sessionDate.getDay();
  const hours = String(sessionDate.getHours()).padStart(2, "0");
  const minutes = String(sessionDate.getMinutes()).padStart(2, "0");
  const timeStr = `${hours}:${minutes}:00`;

  const [availRows] = await pool.query<RowDataPacket[]>(
    `SELECT disponibilidade_id FROM Disponibilidade
     WHERE mentor_id = ? AND dia_semana = ? AND hora_inicio <= ? AND hora_fim > ? AND ativo = 1`,
    [mentorId, dayOfWeek, timeStr, timeStr]
  );

  if (availRows.length === 0) {
    return { available: false, error: "Mentor não disponível neste horário" };
  }

  const [existingSessions] = await pool.query<RowDataPacket[]>(
    `SELECT sessao_id FROM Sessao
     WHERE mentor_id = ? AND data_hora = ? AND status NOT IN ('cancelada') AND status_reserva != 'recusada'`,
    [mentorId, data_hora]
  );

  if (existingSessions.length > 0) {
    return { available: false, error: "Mentor já possui sessão agendada neste horário" };
  }

  return { available: true };
}

export async function findByIdWithDetails(sessaoId: number): Promise<any> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT s.*,
            ua.nome AS aluno_nome, ua.email AS aluno_email,
            ut.nome AS mentor_nome, ut.email AS mentor_email,
            t.cargo AS mentor_cargo, t.empresa AS mentor_empresa
     FROM Sessao s
     JOIN Aluno a ON a.aluno_id = s.aluno_id
     JOIN Usuario ua ON ua.usuario_id = a.usuario_id
     JOIN Mentor t ON t.mentor_id = s.mentor_id
     JOIN Usuario ut ON ut.usuario_id = t.usuario_id
     WHERE s.sessao_id = ?`,
    [sessaoId]
  );

  return rows.length > 0 ? rows[0] : null;
}
