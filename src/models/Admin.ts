import pool from "@/infra/database";
import { RowDataPacket } from "mysql2";
import { forbidden } from "@/lib/errors";

export async function requireAdmin(userId: number): Promise<void> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT is_admin FROM `user` WHERE id = ?", [
    userId,
  ]);
  if (rows.length === 0 || rows[0].is_admin !== 1) {
    throw forbidden("Acesso negado: apenas administradores");
  }
}

export async function listPendingMentors(): Promise<any[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT t.id AS mentor_id, t.user_id, t.title, t.company, t.description,
            t.professional_experience, t.price_per_session, t.rejection_reason,
            u.name, u.email, u.phone, u.cpf, u.created_at,
            u.is_student, u.is_mentor
     FROM mentor t
     JOIN \`user\` u ON u.id = t.user_id
     WHERE t.approval_status = 'pending'
     ORDER BY u.created_at DESC`
  );

  return Promise.all(
    rows.map(async (r: RowDataPacket) => {
      const [techs] = await pool.query<RowDataPacket[]>(
        `SELECT te.name FROM mentor_technology tt
         JOIN technology te ON te.id = tt.technology_id
         WHERE tt.mentor_id = ?`,
        [r.mentor_id]
      );
      const [langs] = await pool.query<RowDataPacket[]>(
        `SELECT i.code, i.name FROM mentor_language tl
         JOIN language i ON i.id = tl.language_id
         WHERE tl.mentor_id = ?`,
        [r.mentor_id]
      );
      return {
        mentor_id: r.mentor_id,
        user_id: r.user_id,
        nome: r.name,
        email: r.email,
        telefone: r.phone,
        cpf: r.cpf,
        criado_em: r.created_at,
        is_aluno: r.is_student === 1,
        is_mentor: r.is_mentor === 1,
        cargo: r.title,
        empresa: r.company,
        descricao: r.description,
        experiencia: r.professional_experience,
        preco: Number(r.price_per_session),
        tecnologias: techs.map((t: RowDataPacket) => t.name),
        idiomas: langs.map((l: RowDataPacket) => ({ code: l.code, name: l.name })),
      };
    })
  );
}

export async function approveMentor(mentorId: number): Promise<void> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT id, user_id FROM mentor WHERE id = ?", [
    mentorId,
  ]);
  if (rows.length === 0) throw forbidden("Mentor não encontrado");
  await pool.query(
    "UPDATE mentor SET approval_status = 'approved', rejection_reason = NULL WHERE id = ?",
    [mentorId]
  );
  // mark profile complete so the mentor skips setup
  await pool.query("UPDATE `user` SET is_mentor_profile_complete = 1 WHERE id = ?", [
    rows[0].user_id,
  ]);
}

export async function rejectMentor(mentorId: number, reason?: string): Promise<void> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT id, user_id FROM mentor WHERE id = ?", [
    mentorId,
  ]);
  if (rows.length === 0) throw forbidden("Mentor não encontrado");
  await pool.query(
    "UPDATE mentor SET approval_status = 'rejected', rejection_reason = ? WHERE id = ?",
    [reason || null, mentorId]
  );
}

export async function listAllMentors(): Promise<any[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT t.id, t.user_id, u.name, u.email, u.is_mentor_profile_complete,
            t.title, t.company, t.price_per_session, t.rating, t.total_reviews,
            t.approval_status, t.rejection_reason
     FROM mentor t
     JOIN \`user\` u ON u.id = t.user_id
     ORDER BY t.id`
  );
  return rows.map((r: RowDataPacket) => ({
    id: r.id,
    user_id: r.user_id,
    nome: r.name,
    email: r.email,
    cargo: r.title,
    empresa: r.company,
    preco: Number(r.price_per_session),
    rating: Number(r.rating),
    total_avaliacoes: r.total_reviews,
    status_aprovacao: r.approval_status,
    motivo_rejeicao: r.rejection_reason,
    perfil_completo: r.is_mentor_profile_complete === 1,
  }));
}

export async function listAllSessions(): Promise<any[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT s.id, s.title, s.area, s.scheduled_at, s.duration_min, s.status,
            s.reservation_status, s.payment_status, s.created_at,
            ua.name AS student_name, ut.name AS mentor_name
     FROM session s
     JOIN student a ON a.id = s.student_id
     JOIN \`user\` ua ON ua.id = a.user_id
     JOIN mentor t ON t.id = s.mentor_id
     JOIN \`user\` ut ON ut.id = t.user_id
     ORDER BY s.scheduled_at DESC`
  );
  return rows.map((r: RowDataPacket) => ({
    id: r.id,
    titulo: r.title,
    area: r.area,
    data_hora: r.scheduled_at,
    duracao_min: r.duration_min,
    status: r.status,
    status_reserva: r.reservation_status,
    status_pagamento: r.payment_status,
    criado_em: r.created_at,
    aluno_nome: r.student_name,
    mentor_nome: r.mentor_name,
  }));
}

export async function listAllPayments(): Promise<any[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.id, p.session_id, p.payer_user_id, p.amount, p.method, p.status,
            p.provider_payment_id, p.created_at,
            ua.name AS payer_name, ut.name AS mentor_name
     FROM payment p
     LEFT JOIN \`user\` ua ON ua.id = p.payer_user_id
     LEFT JOIN session s ON s.id = p.session_id
     LEFT JOIN mentor t ON t.id = s.mentor_id
     LEFT JOIN \`user\` ut ON ut.id = t.user_id
     ORDER BY p.created_at DESC`
  );
  return rows.map((r: RowDataPacket) => ({
    id: r.id,
    sessao_id: r.session_id,
    pagador_id: r.payer_user_id,
    pagador_nome: r.payer_name,
    mentor_nome: r.mentor_name,
    valor: Number(r.amount),
    metodo: r.method,
    status: r.status,
    provider_id: r.provider_payment_id,
    criado_em: r.created_at,
  }));
}

export async function getStats(): Promise<{
  totalUsuarios: number;
  totalMentores: number;
  mentoresPendentes: number;
  totalAlunos: number;
  totalSessoes: number;
  receitaTotal: number;
}> {
  const [u] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) AS c FROM `user`");
  const [m] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS c FROM `user` WHERE is_mentor = 1"
  );
  const [mp] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS c FROM mentor WHERE approval_status = 'pending'"
  );
  const [a] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS c FROM `user` WHERE is_student = 1"
  );
  const [s] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) AS c FROM session");
  const [r] = await pool.query<RowDataPacket[]>(
    "SELECT COALESCE(SUM(amount), 0) AS c FROM payment WHERE status = 'approved'"
  );
  return {
    totalUsuarios: Number(u[0]?.c || 0),
    totalMentores: Number(m[0]?.c || 0),
    mentoresPendentes: Number(mp[0]?.c || 0),
    totalAlunos: Number(a[0]?.c || 0),
    totalSessoes: Number(s[0]?.c || 0),
    receitaTotal: Number(r[0]?.c || 0),
  };
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
