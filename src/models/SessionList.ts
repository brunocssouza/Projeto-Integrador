import pool from "@/infra/database";
import { RowDataPacket } from "mysql2";

export async function listByUser(
  userId: number,
  statusFilter?: string | null
): Promise<{
  sessions: any[];
  isAluno: boolean;
}> {
  const [userRows] = await pool.query<RowDataPacket[]>(
    "SELECT is_aluno, is_mentor FROM usuario WHERE usuario_id = ?",
    [userId]
  );

  if (userRows.length === 0) {
    return { sessions: [], isAluno: false };
  }

  const user = userRows[0];
  const isAluno = user.is_student === 1;

  let query: string;
  let params: (string | number)[];

  if (user.is_mentor && !user.is_student) {
    query = `
      SELECT s.id, s.title, s.area, s.scheduled_at, s.duration_min,
             s.status, s.reservation_status, s.video_platform, s.meeting_link,
             s.joined_student_at, s.joined_mentor_at, s.created_at,
             u.name AS student_name, u.email AS student_email,
             s.student_id, s.mentor_id
      FROM session s
      JOIN student a ON a.id = s.student_id
      JOIN \`user\` u ON u.id = a.user_id
      WHERE s.mentor_id = (SELECT id FROM mentor WHERE user_id = ?)
    `;
    params = [userId];
  } else {
    query = `
      SELECT s.id, s.title, s.area, s.scheduled_at, s.duration_min,
             s.status, s.reservation_status, s.video_platform, s.meeting_link,
             s.joined_student_at, s.joined_mentor_at, s.created_at,
             u.name AS mentor_name, u.email AS mentor_email,
             t.title AS mentor_title, t.company AS mentor_company,
             s.student_id, s.mentor_id
      FROM session s
      JOIN mentor t ON t.id = s.mentor_id
      JOIN \`user\` u ON u.id = t.user_id
      WHERE s.student_id = (SELECT id FROM student WHERE user_id = ?)
    `;
    params = [userId];
  }

  if (statusFilter && statusFilter !== "all") {
    if (["pending", "approved", "rejected"].includes(statusFilter)) {
      query += " AND s.reservation_status = ?";
      params.push(statusFilter);
    } else if (["scheduled", "in_progress", "completed", "cancelled"].includes(statusFilter)) {
      query += " AND s.status = ?";
      params.push(statusFilter);
    }
  }

  query += " ORDER BY s.scheduled_at ASC";
  const [rows] = await pool.query<RowDataPacket[]>(query, params);

  return { sessions: rows, isAluno };
}
