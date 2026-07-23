import pool from "@/infra/database";
import prisma from "@/lib/prisma";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface UserRow {
  id: number;
  cpf: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  avatar_url: string | null;
  is_student: number;
  is_mentor: number;
  is_admin: number;
  is_mentor_profile_complete: number;
  email_verified: number;
}

export type SafeUser = Omit<UserRow, "password_hash" | "cpf">;

function toSafeUser(row: UserRow): SafeUser {
  const { password_hash, cpf, ...safe } = row;
  return safe;
}

export async function findById(userId: number): Promise<UserRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM \`user\` WHERE id = ?`, [userId]);
  return rows.length > 0 ? (rows[0] as UserRow) : null;
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM \`user\` WHERE email = ?`, [
    email,
  ]);
  return rows.length > 0 ? (rows[0] as UserRow) : null;
}

export async function create(data: {
  cpf: string;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  is_student: number;
  is_mentor: number;
  email_verified?: number;
}): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO \`user\` (cpf, name, email, phone, password_hash, is_student, is_mentor, is_mentor_profile_complete, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.cpf,
      data.name,
      data.email,
      data.phone,
      data.password_hash,
      data.is_student,
      data.is_mentor,
      data.is_mentor ? 0 : 1,
      data.email_verified ?? 0,
    ]
  );
  return result.insertId;
}

export async function updateProfile(
  userId: number,
  data: { name?: string; email?: string; phone?: string; avatar_url?: string }
): Promise<void> {
  const updates: string[] = [];
  const values: (string | number)[] = [];
  if (data.name !== undefined) {
    updates.push("name = ?");
    values.push(data.name);
  }
  if (data.email !== undefined) {
    updates.push("email = ?");
    values.push(data.email);
  }
  if (data.phone !== undefined) {
    updates.push("phone = ?");
    values.push(data.phone);
  }
  if (data.avatar_url !== undefined) {
    updates.push("avatar_url = ?");
    values.push(data.avatar_url);
  }
  if (updates.length === 0) return;
  values.push(userId);
  await pool.query(`UPDATE \`user\` SET ${updates.join(", ")} WHERE id = ?`, values);
}

export async function updateAvatar(userId: number, avatarUrl: string): Promise<void> {
  await pool.query(`UPDATE \`user\` SET avatar_url = ? WHERE id = ?`, [avatarUrl, userId]);
}

export async function changePassword(userId: number, newPasswordHash: string): Promise<void> {
  await pool.query(`UPDATE \`user\` SET password_hash = ? WHERE id = ?`, [newPasswordHash, userId]);
}

export async function isAdmin(userId: number): Promise<boolean> {
  const user = await findById(userId);
  return user?.is_admin === 1;
}

export async function deleteAccount(userId: number): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [studentRows] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM student WHERE user_id = ?",
      [userId]
    );
    const [mentorRows] = await conn.query<RowDataPacket[]>(
      "SELECT id FROM mentor WHERE user_id = ?",
      [userId]
    );
    const studentId = studentRows.length > 0 ? studentRows[0].id : null;
    const mentorId = mentorRows.length > 0 ? mentorRows[0].id : null;

    if (mentorId) {
      await conn.query(
        "DELETE FROM payment WHERE session_id IN (SELECT id FROM session WHERE mentor_id = ?)",
        [mentorId]
      );
      await conn.query("DELETE FROM mentor_review WHERE mentor_id = ?", [mentorId]);
      await conn.query("DELETE FROM availability WHERE mentor_id = ?", [mentorId]);
      await conn.query("DELETE FROM mentor_technology WHERE mentor_id = ?", [mentorId]);
      await conn.query("DELETE FROM mentor_language WHERE mentor_id = ?", [mentorId]);
      await conn.query("DELETE FROM session WHERE mentor_id = ?", [mentorId]);
      await conn.query("DELETE FROM mentor WHERE id = ?", [mentorId]);
    }
    if (studentId) {
      await conn.query(
        "DELETE FROM payment WHERE session_id IN (SELECT id FROM session WHERE student_id = ?)",
        [studentId]
      );
      await conn.query("DELETE FROM mentor_review WHERE student_id = ?", [studentId]);
      await conn.query("DELETE FROM session WHERE student_id = ?", [studentId]);
      await conn.query("DELETE FROM student WHERE id = ?", [studentId]);
    }
    await conn.query("DELETE FROM `user` WHERE id = ?", [userId]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function findStudentByUserId(userId: number): Promise<number | null> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT id FROM student WHERE user_id = ?", [
    userId,
  ]);
  return rows.length > 0 ? rows[0].id : null;
}

export const findAlunoByUserId = findStudentByUserId;
