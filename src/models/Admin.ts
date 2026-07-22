import pool from "@/infra/database";
import { RowDataPacket } from "mysql2";

export async function requireAdmin(userId: string): Promise<void> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT is_admin FROM Usuario WHERE usuario_id = ?",
    [userId]
  );
  if (rows.length === 0 || rows[0].is_admin !== 1) {
    throw new Error("Acesso negado: apenas administradores");
  }
}

export async function listAllUsers(): Promise<any[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT u.usuario_id, u.nome, u.email, u.telefone, u.is_aluno, u.is_mentor, u.is_admin,
            u.perfil_mentor_completo, u.criado_em, u.avatar_url,
            t.cargo AS mentor_cargo, t.empresa AS mentor_empresa
     FROM Usuario u
     LEFT JOIN Mentor t ON t.usuario_id = u.usuario_id
     ORDER BY u.criado_em DESC`
  );

  return rows.map((r: RowDataPacket) => ({
    id: r.usuario_id,
    nome: r.nome,
    email: r.email,
    telefone: r.telefone,
    is_aluno: r.is_aluno === 1,
    is_mentor: r.is_mentor === 1,
    is_admin: r.is_admin === 1,
    perfil_mentor_completo: r.perfil_mentor_completo === 1,
    criado_em: r.criado_em,
    avatar_url: r.avatar_url,
    mentor_cargo: r.mentor_cargo,
    mentor_empresa: r.mentor_empresa,
  }));
}

export async function deleteUser(targetUserId: string): Promise<void> {
  const { deleteAccount } = await import("@/models/User");
  await deleteAccount(targetUserId);
}
