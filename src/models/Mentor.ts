import pool from "@/infra/database";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface MentorRow {
  id: number;
  user_id: number;
  title: string;
  company: string | null;
  description: string;
  professional_experience: string | null;
  price_per_session: number;
  rating: number;
  total_reviews: number;
  presentation_video_url: string | null;
}

export async function findByUserId(userId: number): Promise<MentorRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM mentor WHERE user_id = ?", [
    userId,
  ]);
  return rows.length > 0 ? (rows[0] as MentorRow) : null;
}

export async function findById(mentorId: number): Promise<MentorRow | null> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM mentor WHERE id = ?", [mentorId]);
  return rows.length > 0 ? (rows[0] as MentorRow) : null;
}

export async function create(
  userId: number,
  data: {
    title: string;
    company?: string;
    description: string;
    professionalExperience?: string;
    pricePerSession: number;
  }
): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO mentor (user_id, title, company, description, professional_experience, price_per_session) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.title,
      data.company || null,
      data.description,
      data.professionalExperience || null,
      data.pricePerSession,
    ]
  );
  return result.insertId;
}

export async function update(
  mentorId: number,
  data: Record<string, string | number | null>
): Promise<void> {
  const allowedFields = [
    "title",
    "company",
    "description",
    "professional_experience",
    "price_per_session",
    "presentation_video_url",
  ];
  const fieldMap: Record<string, string> = {
    title: "title",
    company: "company",
    description: "description",
    professionalExperience: "professional_experience",
    pricePerSession: "price_per_session",
    presentationVideoUrl: "presentation_video_url",
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
       SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS concluidas,
       COALESCE((SELECT AVG(rating) FROM mentor_review WHERE mentor_id = ?), 0) AS rating,
       (SELECT COUNT(*) FROM mentor_review WHERE mentor_id = ?) AS reviewCount
     FROM session WHERE mentor_id = ?`,
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
    `SELECT t.id, t.user_id, u.name, u.email, t.title, t.company,
            t.description, t.price_per_session, u.avatar_url
     FROM mentor t
     JOIN \`user\` u ON u.id = t.user_id
     ORDER BY t.id`
  );

  return Promise.all(
    rows.map(async (row: RowDataPacket) => {
      const [techs] = await pool.query<RowDataPacket[]>(
        `SELECT te.name FROM mentor_technology tt
         JOIN technology te ON te.id = tt.technology_id
         WHERE tt.mentor_id = ?`,
        [row.id]
      );

      const [ratingRows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total, COALESCE(AVG(rating), 0) AS media
         FROM mentor_review WHERE mentor_id = ?`,
        [row.id]
      );

      const totalReviews = Number(ratingRows[0]?.total || 0);
      const avgRating = totalReviews > 0 ? Number(Number(ratingRows[0]?.media).toFixed(1)) : 0;

      return {
        id: Number(row.id),
        user_id: Number(row.user_id),
        name: row.name,
        email: row.email,
        role: row.title,
        company: row.company,
        rating: avgRating,
        price: Number(row.price_per_session),
        tags: techs.map((t: RowDataPacket) => t.name),
        description: row.description,
        avatar_url: row.avatar_url,
        totalReviews,
      };
    })
  );
}

export async function getProfile(mentorId: number): Promise<any> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT t.*, u.name, u.email, u.avatar_url
     FROM mentor t
     JOIN \`user\` u ON u.id = t.user_id
     WHERE t.id = ?`,
    [mentorId]
  );

  if (rows.length === 0) return null;

  const row = rows[0];

  const [techs] = await pool.query<RowDataPacket[]>(
    `SELECT te.name FROM mentor_technology tt
     JOIN technology te ON te.id = tt.technology_id
     WHERE tt.mentor_id = ?`,
    [mentorId]
  );

  const [langs] = await pool.query<RowDataPacket[]>(
    `SELECT i.code, i.name FROM mentor_language tl
     JOIN language i ON i.id = tl.language_id
     WHERE tl.mentor_id = ?`,
    [mentorId]
  );

  const [reviews] = await pool.query<RowDataPacket[]>(
    `SELECT a.id, a.rating, a.title, a.comment, a.created_at,
            u.name AS student_name
     FROM mentor_review a
     JOIN student al ON al.id = a.student_id
     JOIN \`user\` u ON u.id = al.user_id
     WHERE a.mentor_id = ?
     ORDER BY a.created_at DESC`,
    [mentorId]
  );

  const [availability] = await pool.query<RowDataPacket[]>(
    `SELECT id, day_of_week, start_time, end_time, active, video_platforms
     FROM availability
     WHERE mentor_id = ?
     ORDER BY day_of_week, start_time`,
    [mentorId]
  );

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.title,
    company: row.company,
    description: row.description,
    experience: row.professional_experience,
    price: Number(row.price_per_session),
    rating:
      reviews.length > 0
        ? Number(
            (
              reviews.reduce((sum: number, r: RowDataPacket) => sum + Number(r.rating), 0) /
              reviews.length
            ).toFixed(1)
          )
        : 0,
    totalReviews: reviews.length,
    avatar_url: row.avatar_url,
    technologies: techs.map((t: RowDataPacket) => t.name),
    languages: langs.map((l: RowDataPacket) => ({ code: l.code, name: l.name })),
    reviews: reviews.map((r: RowDataPacket) => ({
      id: r.id,
      rating: Number(r.rating),
      title: r.title,
      comment: r.comment,
      date: r.created_at,
      studentName: r.student_name,
    })),
    availability: availability.map((a: RowDataPacket) => ({
      id: a.id,
      dayOfWeek: a.day_of_week,
      startTime: a.start_time,
      endTime: a.end_time,
      active: a.active === 1,
      plataformasVideo: a.video_platforms ? a.video_platforms.split(",") : [],
    })),
  };
}

export async function getAvailability(mentorId: number): Promise<any[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, day_of_week, start_time, end_time, active, video_platforms
     FROM availability
     WHERE mentor_id = ?
     ORDER BY day_of_week, start_time`,
    [mentorId]
  );

  return rows.map((r: RowDataPacket) => ({
    id: r.id,
    dayOfWeek: r.day_of_week,
    startTime: r.start_time,
    endTime: r.end_time,
    active: r.active === 1,
    plataformasVideo: r.video_platforms ? r.video_platforms.split(",") : [],
  }));
}

export async function updateAvailability(
  mentorId: number,
  slots: { dayOfWeek: number; startTime: string; endTime: string; plataformasVideo?: string[] }[]
): Promise<void> {
  await pool.query("DELETE FROM availability WHERE mentor_id = ?", [mentorId]);

  if (slots && slots.length > 0) {
    for (const slot of slots) {
      const platforms =
        slot.plataformasVideo && slot.plataformasVideo.length > 0
          ? slot.plataformasVideo.join(",")
          : null;
      await pool.query(
        `INSERT INTO availability (mentor_id, day_of_week, start_time, end_time, active, video_platforms) VALUES (?, ?, ?, ?, 1, ?)`,
        [mentorId, slot.dayOfWeek, slot.startTime, slot.endTime, platforms]
      );
    }
  }
}

export async function getStudents(
  mentorId: number
): Promise<{ alunosAtivos: number; sessoesMes: number; mediaAvaliacao: number; students: any[] }> {
  const [statRows] = await pool.query<RowDataPacket[]>(
    `SELECT
       COUNT(DISTINCT s.student_id) AS alunos_ativos,
       SUM(CASE WHEN s.status = 'completed' THEN 1 ELSE 0 END) AS sessoes_mes,
       COALESCE((SELECT AVG(rating) FROM mentor_review WHERE mentor_id = ?), 0) AS media
     FROM session s
     WHERE s.mentor_id = ? AND s.status IN ('completed', 'in_progress')`,
    [mentorId, mentorId]
  );

  const [alunos] = await pool.query<RowDataPacket[]>(
    `SELECT al.id, u.name,
            COUNT(s.id) AS total_sessoes,
            MAX(s.scheduled_at) AS ultima_sessao,
            GROUP_CONCAT(DISTINCT s.area SEPARATOR ', ') AS areas
     FROM student al
     JOIN \`user\` u ON u.id = al.user_id
     JOIN session s ON s.student_id = al.id
     WHERE s.mentor_id = ? AND s.status = 'completed'
     GROUP BY al.id, u.name
     ORDER BY ultima_sessao DESC`,
    [mentorId]
  );

  const s = statRows[0] || {};
  const students = alunos.map((a: RowDataPacket) => {
    const name = a.name as string;
    return {
      id: a.id,
      name,
      initials: name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join(""),
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
  await pool.query("DELETE FROM mentor_technology WHERE mentor_id = ?", [mentorId]);

  if (tecnologias && tecnologias.length > 0) {
    for (const techName of tecnologias) {
      const [techRows] = await pool.query<RowDataPacket[]>(
        "SELECT id FROM technology WHERE name = ?",
        [techName]
      );

      let techId: number;
      if (techRows.length === 0) {
        const [newTech] = await pool.query<ResultSetHeader>(
          "INSERT INTO technology (name) VALUES (?)",
          [techName]
        );
        techId = newTech.insertId;
      } else {
        techId = techRows[0].id;
      }

      await pool.query(
        "INSERT IGNORE INTO mentor_technology (mentor_id, technology_id) VALUES (?, ?)",
        [mentorId, techId]
      );
    }
  }
}

export async function setProfileComplete(userId: number): Promise<void> {
  await pool.query(`UPDATE \`user\` SET is_mentor_profile_complete = 1 WHERE id = ?`, [userId]);
}

export async function findMentorIdByUserId(userId: number): Promise<number | null> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT id FROM mentor WHERE user_id = ?", [
    userId,
  ]);
  return rows.length > 0 ? rows[0].id : null;
}
