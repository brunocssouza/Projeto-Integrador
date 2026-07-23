import pool from "@/infra/database";
import { RowDataPacket } from "mysql2";

export async function findByMentorId(mentorId: number): Promise<any[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT a.id, a.rating, a.title, a.comment, a.created_at,
            u.name AS student_name
     FROM mentor_review a
     JOIN student al ON al.id = a.student_id
     JOIN \`user\` u ON u.id = al.user_id
     WHERE a.mentor_id = ?
     ORDER BY a.created_at DESC`,
    [mentorId]
  );

  return rows.map((r: RowDataPacket) => ({
    id: r.id,
    rating: Number(r.rating),
    title: r.title,
    comment: r.comment,
    date: r.created_at,
    studentName: r.student_name,
  }));
}

export async function getStats(mentorId: number): Promise<{ total: number; media: number }> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total, COALESCE(AVG(rating), 0) AS media
     FROM mentor_review WHERE mentor_id = ?`,
    [mentorId]
  );
  return {
    total: Number(rows[0]?.total || 0),
    media: Number(Number(rows[0]?.media || 0).toFixed(1)),
  };
}
