import pool from "@/infra/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface SessionRow {
  id: number;
  student_id: number;
  mentor_id: number;
  title: string;
  area: string;
  scheduled_at: string;
  duration_min: number;
  status: string;
  reservation_status: string;
  video_platform: string | null;
  meeting_link: string | null;
  joined_mentor_at: string | null;
  joined_student_at: string | null;
  cancelled_by: number | null;
  cancellation_reason: string | null;
}

export interface Ownership {
  isOwner: boolean;
  isMentor: boolean;
  isAluno: boolean;
}

export async function findById(sessaoId: number): Promise<SessionRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM session WHERE id = ?", [
    sessaoId,
  ]);
  return rows.length > 0 ? (rows[0] as SessionRow) : null;
}

export async function verifyOwnership(sessaoId: number, userId: number): Promise<Ownership> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       CASE WHEN t.user_id = ? THEN 1 ELSE 0 END AS is_mentor_owner,
       CASE WHEN a.user_id = ? THEN 1 ELSE 0 END AS is_aluno_owner
     FROM session s
     LEFT JOIN mentor t ON t.id = s.mentor_id
     LEFT JOIN student a ON a.id = s.student_id
     WHERE s.id = ?`,
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
  student_id: number;
  mentor_id: number;
  title: string;
  area: string;
  scheduled_at: string;
  duration_min: number;
  video_platform?: string;
  preco: number;
}): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO session (student_id, mentor_id, title, area, scheduled_at, duration_min, status, reservation_status, video_platform) VALUES (?, ?, ?, ?, ?, ?, 'scheduled', 'pending', ?)`,
    [
      data.student_id,
      data.mentor_id,
      data.title,
      data.area,
      data.scheduled_at,
      data.duration_min,
      data.video_platform || null,
    ]
  );

  const sessaoId = result.insertId;

  await pool.query(
    "INSERT INTO payment (session_id, amount, method, status) VALUES (?, ?, 'pix', 'pending')",
    [sessaoId, data.preco]
  );

  return sessaoId;
}

export async function approve(sessaoId: number): Promise<void> {
  await pool.query("UPDATE session SET reservation_status = 'approved' WHERE id = ?", [sessaoId]);
}

export async function decline(sessaoId: number): Promise<void> {
  await pool.query("UPDATE session SET reservation_status = 'rejected' WHERE id = ?", [sessaoId]);
}

export async function cancel(sessaoId: number, userId: number, motivo?: string): Promise<void> {
  await pool.query(
    `UPDATE session SET status = 'cancelled', cancelled_by = ?, cancellation_reason = ? WHERE id = ?`,
    [userId, motivo || null, sessaoId]
  );
}

export async function updateLink(sessaoId: number, link: string): Promise<void> {
  await pool.query("UPDATE session SET meeting_link = ? WHERE id = ?", [link, sessaoId]);
}

export async function start(sessaoId: number): Promise<void> {
  await pool.query("UPDATE session SET status = 'in_progress' WHERE id = ?", [sessaoId]);
}

export async function complete(sessaoId: number): Promise<void> {
  await pool.query("UPDATE session SET status = 'completed' WHERE id = ?", [sessaoId]);
}

export async function joinAsMentor(sessaoId: number): Promise<void> {
  await pool.query(
    "UPDATE session SET joined_mentor_at = NOW() WHERE id = ? AND joined_mentor_at IS NULL",
    [sessaoId]
  );
}

export async function joinAsAluno(sessaoId: number): Promise<void> {
  await pool.query(
    "UPDATE session SET joined_student_at = NOW() WHERE id = ? AND joined_student_at IS NULL",
    [sessaoId]
  );
}

export async function checkAvailability(
  mentorId: number,
  scheduledAt: string,
  durationMin: number
): Promise<{ available: boolean; error?: string }> {
  const sessionDate = new Date(scheduledAt);
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
    `SELECT id FROM availability
     WHERE mentor_id = ? AND day_of_week = ? AND start_time <= ? AND end_time > ? AND active = 1`,
    [mentorId, dayOfWeek, timeStr, timeStr]
  );

  if (availRows.length === 0) {
    return { available: false, error: "Mentor não disponível neste horário" };
  }

  const [existingSessions] = await pool.query<RowDataPacket[]>(
    `SELECT id FROM session
     WHERE mentor_id = ? AND scheduled_at = ? AND status NOT IN ('cancelled') AND reservation_status != 'rejected'`,
    [mentorId, scheduledAt]
  );

  if (existingSessions.length > 0) {
    return { available: false, error: "Mentor já possui sessão agendada neste horário" };
  }

  return { available: true };
}

export async function findByIdWithDetails(sessaoId: number): Promise<any> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT s.*,
            ua.name AS student_name, ua.email AS student_email,
            ut.name AS mentor_name, ut.email AS mentor_email,
            t.title AS mentor_title, t.company AS mentor_company
     FROM session s
     JOIN student a ON a.id = s.student_id
     JOIN \`user\` ua ON ua.id = a.user_id
     JOIN mentor t ON t.id = s.mentor_id
     JOIN \`user\` ut ON ut.id = t.user_id
     WHERE s.id = ?`,
    [sessaoId]
  );

  return rows.length > 0 ? rows[0] : null;
}
