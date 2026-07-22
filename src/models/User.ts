import pool from "@/infra/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface UserRow {
  usuario_id: number;
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  senha_hash: string;
  avatar_url: string | null;
  is_aluno: number;
  is_mentor: number;
  is_admin: number;
  perfil_mentor_completo: number;
}

export type SafeUser = Omit<UserRow, "senha_hash" | "cpf">;

function toSafeUser(row: UserRow): SafeUser {
  const { senha_hash, cpf, ...safe } = row;
  return safe;
}

export async function findById(userId: number): Promise<UserRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM Usuario WHERE usuario_id = ?",
    [userId]
  );
  return rows.length > 0 ? (rows[0] as UserRow) : null;
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM Usuario WHERE email = ?",
    [email]
  );
  return rows.length > 0 ? (rows[0] as UserRow) : null;
}

export async function create(data: {
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  senha_hash: string;
  is_aluno: number;
  is_mentor: number;
}): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO Usuario (cpf, nome, email, telefone, senha_hash, is_aluno, is_mentor, perfil_mentor_completo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.cpf, data.nome, data.email, data.telefone, data.senha_hash, data.is_aluno, data.is_mentor, data.is_mentor ? 0 : 1]
  );
  return result.insertId;
}

export async function updateProfile(userId: number, data: { nome?: string; email?: string }): Promise<void> {
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (data.nome !== undefined) {
    updates.push("nome = ?");
    values.push(data.nome);
  }
  if (data.email !== undefined) {
    updates.push("email = ?");
    values.push(data.email);
  }

  if (updates.length === 0) return;

  values.push(userId);
  await pool.query(`UPDATE Usuario SET ${updates.join(", ")} WHERE usuario_id = ?`, values);
}

export async function updateAvatar(userId: number, avatarUrl: string): Promise<void> {
  await pool.query("UPDATE Usuario SET avatar_url = ? WHERE usuario_id = ?", [avatarUrl, userId]);
}

export async function changePassword(userId: number, novaSenhaHash: string): Promise<void> {
  await pool.query("UPDATE Usuario SET senha_hash = ? WHERE usuario_id = ?", [novaSenhaHash, userId]);
}

export async function isAdmin(userId: number): Promise<boolean> {
  const user = await findById(userId);
  return user?.is_admin === 1;
}

export async function deleteAccount(userId: number): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [alunoRows] = await conn.query<RowDataPacket[]>(
      "SELECT aluno_id FROM Aluno WHERE usuario_id = ?", [userId]
    );
    const [mentorRows] = await conn.query<RowDataPacket[]>(
      "SELECT mentor_id FROM Mentor WHERE usuario_id = ?", [userId]
    );

    const alunoId = alunoRows.length > 0 ? alunoRows[0].aluno_id : null;
    const mentorId = mentorRows.length > 0 ? mentorRows[0].mentor_id : null;

    if (mentorId) {
      await conn.query("DELETE FROM Pagamento WHERE sessao_id IN (SELECT sessao_id FROM Sessao WHERE mentor_id = ?)", [mentorId]);
      await conn.query("DELETE FROM Avaliacao_Mentor WHERE mentor_id = ?", [mentorId]);
      await conn.query("DELETE FROM Disponibilidade WHERE mentor_id = ?", [mentorId]);
      await conn.query("DELETE FROM Mentor_Tecnologia WHERE mentor_id = ?", [mentorId]);
      await conn.query("DELETE FROM Mentor_Idioma WHERE mentor_id = ?", [mentorId]);
      await conn.query("DELETE FROM Sessao WHERE mentor_id = ?", [mentorId]);
      await conn.query("DELETE FROM Mentor WHERE mentor_id = ?", [mentorId]);
    }

    if (alunoId) {
      await conn.query("DELETE FROM Pagamento WHERE sessao_id IN (SELECT sessao_id FROM Sessao WHERE aluno_id = ?)", [alunoId]);
      await conn.query("DELETE FROM Avaliacao_Mentor WHERE aluno_id = ?", [alunoId]);
      await conn.query("DELETE FROM Sessao WHERE aluno_id = ?", [alunoId]);
      await conn.query("DELETE FROM Aluno WHERE aluno_id = ?", [alunoId]);
    }

    await conn.query("DELETE FROM Usuario WHERE usuario_id = ?", [userId]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function findAlunoByUserId(userId: number): Promise<number | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT aluno_id FROM Aluno WHERE usuario_id = ?",
    [userId]
  );
  return rows.length > 0 ? rows[0].aluno_id : null;
}
