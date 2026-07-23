import pool from "@/infra/database";
import { RowDataPacket } from "mysql2";

export async function requireAdmin(userId: number): Promise<void> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT is_admin FROM `user` WHERE id = ?", [
    userId,
  ]);
  if (rows.length === 0 || rows[0].is_admin !== 1) {
    throw new Error("Acesso negado: apenas administradores");
  }
}

export async function listAllUsers(): Promise<any[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.id, u.name, u.email, u.phone, u.is_student, u.is_mentor, u.is_admin,
            u.is_mentor_profile_complete, u.created_at, u.avatar_url,
            t.title AS mentor_title, t.company AS mentor_company
     FROM \`user\` u
     LEFT JOIN mentor t ON t.user_id = u.id
     ORDER BY u.created_at DESC`
  );

  return rows.map((r: RowDataPacket) => ({
    id: r.id,
    nome: r.name,
    email: r.email,
    telefone: r.phone,
    is_aluno: r.is_student === 1,
    is_mentor: r.is_mentor === 1,
    is_admin: r.is_admin === 1,
    perfil_mentor_completo: r.is_mentor_profile_complete === 1,
    criado_em: r.created_at,
    avatar_url: r.avatar_url,
    mentor_cargo: r.mentor_title,
    mentor_empresa: r.mentor_company,
  }));
}

export async function deleteUser(targetUserId: number): Promise<void> {
  const { deleteAccount } = await import("@/models/User");
  await deleteAccount(targetUserId);
}
