import pool from "@/infra/database";
import { RowDataPacket } from "mysql2";

export async function getByStudentId(studentId: number): Promise<{
  transactions: any[];
  total: number;
}> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.id, p.amount, p.status AS payment_status,
            s.title, s.area, s.scheduled_at, s.duration_min, s.status AS session_status,
            u.name AS mentor_name
     FROM payment p
     JOIN session s ON s.id = p.session_id
     JOIN mentor t ON t.id = s.mentor_id
     JOIN \`user\` u ON u.id = t.user_id
     WHERE s.student_id = ?
     ORDER BY s.scheduled_at DESC`,
    [studentId]
  );

  const total = rows.reduce((sum, r: RowDataPacket) => sum + Number(r.amount || 0), 0);

  return {
    transactions: rows.map((r: RowDataPacket) => ({
      id: r.id,
      title: r.title,
      area: r.area,
      mentorName: r.mentor_name,
      dateTime: r.scheduled_at,
      duration: r.duration_min,
      status: r.sessao_status,
      valor: Number(r.valor || 0),
    })),
    total: Number(total.toFixed(2)),
  };
}
