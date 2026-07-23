import mysql, { Pool } from "mysql2/promise";
import { hash } from "bcryptjs";

let pool: Pool;

async function getPool() {
  return mysql.createPool({
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "root",
    database: process.env.DATABASE_NAME || "mock_mentor",
  });
}

async function seed() {
  const passwordHash = await hash("123456", 10);
  pool = await getPool();

  console.log("🔹 Seeding database...\n");

  // --- Catalog tables ---
  const languages: [string, string][] = [
    ["Português", "PT"],
    ["Inglês", "EN"],
    ["Espanhol", "ES"],
  ];
  for (const [n, s] of languages) {
    await pool.query("INSERT IGNORE INTO language (name, code) VALUES (?, ?)", [n, s]);
  }

  const technologies: [string, string][] = [
    ["React", "tech"],
    ["TypeScript", "tech"],
    ["Next.js", "tech"],
    ["Node.js", "tech"],
    ["Python", "tech"],
    ["Java", "tech"],
    ["AWS", "tech"],
    ["Docker", "tech"],
    ["PostgreSQL", "tech"],
  ];
  for (const [n, c] of technologies) {
    await pool.query("INSERT IGNORE INTO technology (name, category) VALUES (?, ?)", [n, c]);
  }
  console.log("  Catalog tables: OK");

  // --- Helper: create user ---
  async function createUser(
    name: string,
    email: string,
    cpf: string,
    isStudent: boolean,
    isMentor: boolean,
    isAdmin = false,
    profileComplete = false
  ): Promise<number> {
    const [r] = await pool.query(
      `INSERT INTO \`user\` (cpf, name, email, phone, password_hash, is_student, is_mentor, is_admin, email_verified, is_mentor_profile_complete)
       VALUES (?, ?, ?, '(11) 90000-0000', ?, ?, ?, ?, 1, ?)`,
      [
        cpf,
        name,
        email,
        passwordHash,
        isStudent ? 1 : 0,
        isMentor ? 1 : 0,
        isAdmin ? 1 : 0,
        profileComplete ? 1 : 0,
      ]
    );
    const id = (r as any).insertId;
    console.log(`  ✅ ${email} (id=${id})`);
    return id;
  }

  // --- Helper: create student ---
  async function createStudent(userId: number): Promise<number> {
    await pool.query("INSERT IGNORE INTO student (user_id) VALUES (?)", [userId]);
    const [rows] = await pool.query("SELECT id FROM student WHERE user_id = ?", [userId]);
    return (rows as any[])[0].id;
  }

  // --- Helper: create mentor ---
  async function createMentor(
    userId: number,
    title: string,
    description: string,
    price: number
  ): Promise<number> {
    const [r] = await pool.query(
      "INSERT INTO mentor (user_id, title, description, price_per_session, approved) VALUES (?, ?, ?, ?, 1)",
      [userId, title, description, price]
    );
    return (r as any).insertId;
  }

  // ============================================================
  console.log("\nTest Users:");
  // ============================================================

  // 1. aluno@aluno.com — Student only
  const aId = await createUser("Aluno Teste", "aluno@aluno.com", "11122233344", true, false);
  await createStudent(aId);

  // 2. mentor@mentor.com — Mentor only
  const mId = await createUser(
    "Mentor Teste",
    "mentor@mentor.com",
    "22233344455",
    false,
    true,
    false,
    true
  );
  const mentorPk = await createMentor(
    mId,
    "Full Stack Developer",
    "Mentor experiente com 10+ anos de carreira.",
    150.0
  );
  await pool.query("INSERT INTO user_language (user_id, language_id) VALUES (?,1),(?,2)", [
    mId,
    mId,
  ]);
  await pool.query("INSERT INTO mentor_language (mentor_id, language_id) VALUES (?,1),(?,2)", [
    mentorPk,
    mentorPk,
  ]);
  await pool.query(
    "INSERT INTO mentor_technology (mentor_id, technology_id) VALUES (?,1),(?,2),(?,3)",
    [mentorPk, mentorPk, mentorPk]
  );
  await pool.query(
    "INSERT INTO availability (mentor_id, day_of_week, start_time, end_time, video_platforms) VALUES (?,1,'09:00','12:00','google_meet,zoom'), (?,1,'14:00','18:00','google_meet'), (?,3,'09:00','12:00','google_meet,microsoft_teams')",
    [mentorPk, mentorPk, mentorPk]
  );

  // 3. alunomentor@alunomentor.com — Both
  const amId = await createUser(
    "Aluno Mentor",
    "alunomentor@alunomentor.com",
    "33344455566",
    true,
    true,
    false,
    true
  );
  await createStudent(amId);
  const amPk = await createMentor(amId, "Tech Lead", "Especialista em React e Node.js.", 120.0);
  await pool.query("INSERT INTO user_language (user_id, language_id) VALUES (?,1),(?,2)", [
    amId,
    amId,
  ]);
  await pool.query("INSERT INTO mentor_language (mentor_id, language_id) VALUES (?,1),(?,2)", [
    amPk,
    amPk,
  ]);
  await pool.query(
    "INSERT INTO mentor_technology (mentor_id, technology_id) VALUES (?,1),(?,2),(?,5)",
    [amPk, amPk, amPk]
  );
  await pool.query(
    "INSERT INTO availability (mentor_id, day_of_week, start_time, end_time, video_platforms) VALUES (?,2,'10:00','13:00','google_meet'), (?,4,'14:00','17:00','zoom')",
    [amPk, amPk]
  );

  // 4. admin@admin.com — Administrator
  await createUser("Administrador", "admin@admin.com", "00000000000", true, true, true, true);

  console.log("\nSeed complete!");
  console.log(
    "   aluno@aluno.com | mentor@mentor.com | alunomentor@alunomentor.com | admin@admin.com\n"
  );

  await pool.end();
}

seed().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
