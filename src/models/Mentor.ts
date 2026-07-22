import pool from "@/infra/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface MentorRow {
  mentor_id: number;
  usuario_id: number;
  cargo: string;
  empresa: string | null;
  descricao: string;
  experiencia_profissional: string | null;
  preco_por_sessao: number;
  rating: number;
  total_avaliacoes: number;
  video_apresentacao_url: string | null;
}

export async function findByUserId(userId: number): Promise<MentorRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM Mentor WHERE usuario_id = ?",
    [userId]
  );
  return rows.length > 0 ? (rows[0] as MentorRow) : null;
}

export async function findById(mentorId: number): Promise<MentorRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM Mentor WHERE mentor_id = ?",
    [mentorId]
  );
  return rows.length > 0 ? (rows[0] as MentorRow) : null;
}

export async function create(userId: number, data: {
  cargo: string;
  empresa?: string;
  descricao: string;
  experiencia?: string;
  preco: number;
}): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO Mentor (usuario_id, cargo, empresa, descricao, experiencia_profissional, preco_por_sessao)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, data.cargo, data.empresa || null, data.descricao, data.experiencia || null, data.preco]
  );
  return result.insertId;
}

export async function update(mentorId: number, data: Record<string, string | number | null>): Promise<void> {
  const allowedFields = ["cargo", "empresa", "descricao", "experiencia_profissional", "preco_por_sessao", "video_apresentacao_url"];
  const fieldMap: Record<string, string> = {
    cargo: "cargo",
    empresa: "empresa",
    descricao: "descricao",
    experiencia: "experiencia_profissional",
    precoPorSessao: "preco_por_sessao",
    videoApresentacao: "video_apresentacao_url",
  };

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  for (const [key, value] of Object.entries(data)) {
    const dbField = fieldMap[key];
    if (dbField && allowedFields.includes(dbField)) {
      updates.push(`${dbField} = ?`);
      values.push(value);
    }
  }

  if (updates.length === 0) return;

  values.push(mentorId);
  await pool.query(`UPDATE Mentor SET ${updates.join(", ")} WHERE mentor_id = ?`, values);
}

export async function getStats(mentorId: number): Promise<{
  total: number;
  concluidas: number;
  rating: number;
  reviewCount: number;
}> {
  const [statRows] = await pool.query<RowDataPacket[]>(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) AS concluidas,
       COALESCE((SELECT AVG(nota) FROM Avaliacao_Mentor WHERE mentor_id = ?), 0) AS rating,
       (SELECT COUNT(*) FROM Avaliacao_Mentor WHERE mentor_id = ?) AS reviewCount
     FROM Sessao WHERE mentor_id = ?`,
    [mentorId, mentorId, mentorId]
  );

  const s = statRows[0] || {};
  return {
    total: Number(s.total || 0),
    concluidas: Number(s.concluidas || 0),
    rating: Number(Number(s.rating || 0).toFixed(1)),
    reviewCount: Number(s.reviewCount || 0),
  };
}

export async function list(): Promise<any[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT t.mentor_id, t.usuario_id, u.nome, u.email, t.cargo, t.empresa,
            t.descricao, t.preco_por_sessao, u.avatar_url
     FROM Mentor t
     JOIN Usuario u ON u.usuario_id = t.usuario_id
     ORDER BY t.mentor_id`
  );

  return Promise.all(
    rows.map(async (row: RowDataPacket) => {
      const [techs] = await pool.query<RowDataPacket[]>(
        `SELECT te.nome FROM Mentor_Tecnologia tt
         JOIN Tecnologia te ON te.tecnologia_id = tt.tecnologia_id
         WHERE tt.mentor_id = ?`,
        [row.mentor_id]
      );

      const [ratingRows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total, COALESCE(AVG(nota), 0) AS media
         FROM Avaliacao_Mentor WHERE mentor_id = ?`,
        [row.mentor_id]
      );

      const totalReviews = Number(ratingRows[0]?.total || 0);
      const avgRating = totalReviews > 0 ? Number(Number(ratingRows[0]?.media).toFixed(1)) : 0;

      return {
        id: row.mentor_id,
        name: row.nome,
        role: row.cargo,
        company: row.empresa,
        rating: avgRating,
        price: Number(row.preco_por_sessao),
        tags: techs.map((t: RowDataPacket) => t.nome),
        description: row.descricao,
        avatar_url: row.avatar_url,
        totalReviews,
      };
    })
  );
}

export async function getProfile(mentorId: number): Promise<any> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT t.*, u.nome, u.email, u.avatar_url
     FROM Mentor t
     JOIN Usuario u ON u.usuario_id = t.usuario_id
     WHERE t.mentor_id = ?`,
    [mentorId]
  );

  if (rows.length === 0) return null;

  const row = rows[0];

  const [techs] = await pool.query<RowDataPacket[]>(
    `SELECT te.nome FROM Mentor_Tecnologia tt
     JOIN Tecnologia te ON te.tecnologia_id = tt.tecnologia_id
     WHERE tt.mentor_id = ?`,
    [mentorId]
  );

  const [langs] = await pool.query<RowDataPacket[]>(
    `SELECT i.sigla, i.nome FROM Mentor_Idioma ti
     JOIN Idioma i ON i.idioma_id = ti.idioma_id
     WHERE ti.mentor_id = ?`,
    [mentorId]
  );

  const [reviews] = await pool.query<RowDataPacket[]>(
    `SELECT a.avaliacao_id, a.nota, a.titulo, a.comentario, a.criado_em,
            u.nome AS aluno_nome
     FROM Avaliacao_Mentor a
     JOIN Aluno al ON al.aluno_id = a.aluno_id
     JOIN Usuario u ON u.usuario_id = al.usuario_id
     WHERE a.mentor_id = ?
     ORDER BY a.criado_em DESC`,
    [mentorId]
  );

  const [availability] = await pool.query<RowDataPacket[]>(
    `SELECT disponibilidade_id, dia_semana, hora_inicio, hora_fim, ativo, plataformas_video
     FROM Disponibilidade
     WHERE mentor_id = ?
     ORDER BY dia_semana, hora_inicio`,
    [mentorId]
  );

  return {
    id: row.mentor_id,
    name: row.nome,
    email: row.email,
    role: row.cargo,
    company: row.empresa,
    description: row.descricao,
    experience: row.experiencia_profissional,
    price: Number(row.preco_por_sessao),
    rating: reviews.length > 0
      ? Number((reviews.reduce((sum: number, r: RowDataPacket) => sum + Number(r.nota), 0) / reviews.length).toFixed(1))
      : 0,
    totalReviews: reviews.length,
    avatar_url: row.avatar_url,
    technologies: techs.map((t: RowDataPacket) => t.nome),
    languages: langs.map((l: RowDataPacket) => ({ sigla: l.sigla, name: l.nome })),
    reviews: reviews.map((r: RowDataPacket) => ({
      id: r.avaliacao_id,
      rating: Number(r.nota),
      title: r.titulo,
      comment: r.comentario,
      date: r.criado_em,
      studentName: r.aluno_nome,
    })),
    availability: availability.map((a: RowDataPacket) => ({
      id: a.disponibilidade_id,
      dayOfWeek: a.dia_semana,
      startTime: a.hora_inicio,
      endTime: a.hora_fim,
      active: a.ativo === 1,
      plataformasVideo: a.plataformas_video ? a.plataformas_video.split(",") : [],
    })),
  };
}

export async function getAvailability(mentorId: number): Promise<any[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT disponibilidade_id, dia_semana, hora_inicio, hora_fim, ativo, plataformas_video
     FROM Disponibilidade
     WHERE mentor_id = ?
     ORDER BY dia_semana, hora_inicio`,
    [mentorId]
  );

  return rows.map((r: RowDataPacket) => ({
    id: r.disponibilidade_id,
    dayOfWeek: r.dia_semana,
    startTime: r.hora_inicio,
    endTime: r.hora_fim,
    active: r.ativo === 1,
    plataformasVideo: r.plataformas_video ? r.plataformas_video.split(",") : [],
  }));
}

export async function updateAvailability(
  mentorId: number,
  slots: { dayOfWeek: number; startTime: string; endTime: string; plataformasVideo?: string[] }[]
): Promise<void> {
  await pool.query("DELETE FROM Disponibilidade WHERE mentor_id = ?", [mentorId]);

  if (slots && slots.length > 0) {
    for (const slot of slots) {
      const platforms = slot.plataformasVideo && slot.plataformasVideo.length > 0
        ? slot.plataformasVideo.join(",")
        : null;
      await pool.query(
        `INSERT INTO Disponibilidade (mentor_id, dia_semana, hora_inicio, hora_fim, ativo, plataformas_video)
         VALUES (?, ?, ?, ?, 1, ?)`,
        [mentorId, slot.dayOfWeek, slot.startTime, slot.endTime, platforms]
      );
    }
  }
}

export async function getStudents(mentorId: number): Promise<{ alunosAtivos: number; sessoesMes: number; mediaAvaliacao: number; students: any[] }> {
  const [statRows] = await pool.query<RowDataPacket[]>(
    `SELECT
       COUNT(DISTINCT s.aluno_id) AS alunos_ativos,
       SUM(CASE WHEN s.status = 'concluida' THEN 1 ELSE 0 END) AS sessoes_mes,
       COALESCE((SELECT AVG(nota) FROM Avaliacao_Mentor WHERE mentor_id = ?), 0) AS media
     FROM Sessao s
     WHERE s.mentor_id = ? AND s.status IN ('concluida', 'em_andamento')`,
    [mentorId, mentorId]
  );

  const [alunos] = await pool.query<RowDataPacket[]>(
    `SELECT al.aluno_id, u.nome,
            COUNT(s.sessao_id) AS total_sessoes,
            MAX(s.data_hora) AS ultima_sessao,
            GROUP_CONCAT(DISTINCT s.area SEPARATOR ', ') AS areas
     FROM Aluno al
     JOIN Usuario u ON u.usuario_id = al.usuario_id
     JOIN Sessao s ON s.aluno_id = al.aluno_id
     WHERE s.mentor_id = ? AND s.status = 'concluida'
     GROUP BY al.aluno_id, u.nome
     ORDER BY ultima_sessao DESC`,
    [mentorId]
  );

  const s = statRows[0] || {};
  const students = alunos.map((a: RowDataPacket) => {
    const name = a.nome as string;
    return {
      id: a.aluno_id,
      name,
      initials: name.split(" ").map((n: string) => n[0]).slice(0, 2).join(""),
      specialty: a.areas || "Geral",
      sessions: Number(a.total_sessoes),
      lastSession: a.ultima_sessao,
    };
  });

  return {
    alunosAtivos: students.length,
    sessoesMes: Number(s.sessoes_mes || 0),
    mediaAvaliacao: Number(Number(s.media || 0).toFixed(1)),
    students,
  };
}

export async function syncTechnologies(mentorId: number, tecnologias: string[]): Promise<void> {
  await pool.query("DELETE FROM Mentor_Tecnologia WHERE mentor_id = ?", [mentorId]);

  if (tecnologias && tecnologias.length > 0) {
    for (const techName of tecnologias) {
      const [techRows] = await pool.query<RowDataPacket[]>(
        "SELECT tecnologia_id FROM Tecnologia WHERE nome = ?",
        [techName]
      );

      let techId: number;
      if (techRows.length === 0) {
        const [newTech] = await pool.query<ResultSetHeader>(
          "INSERT INTO Tecnologia (nome) VALUES (?)",
          [techName]
        );
        techId = newTech.insertId;
      } else {
        techId = techRows[0].tecnologia_id;
      }

      await pool.query("INSERT IGNORE INTO Mentor_Tecnologia (mentor_id, tecnologia_id) VALUES (?, ?)", [mentorId, techId]);
    }
  }
}

export async function setProfileComplete(userId: number): Promise<void> {
  await pool.query("UPDATE Usuario SET perfil_mentor_completo = 1 WHERE usuario_id = ?", [userId]);
}

export async function findMentorIdByUserId(userId: number): Promise<number | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT mentor_id FROM Mentor WHERE usuario_id = ?",
    [userId]
  );
  return rows.length > 0 ? rows[0].mentor_id : null;
}
