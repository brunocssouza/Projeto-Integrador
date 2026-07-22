import mysql, { type RowDataPacket, Pool } from "mysql2/promise";
import { hash } from "bcryptjs";

async function getPool() {
  return mysql.createPool({
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "root",
    database: process.env.DATABASE_NAME || "mock_mentor",
  });
}

export async function seedData(pool: Pool) {
  const hashed = await hash("123456", 12);

  try {
    // ============================================================
    // Seed catalog tables
    // ============================================================
    const idiomas = [
      ["Portugues", "PT"],
      ["Ingles", "EN"],
      ["Espanhol", "ES"],
      ["Frances", "FR"],
      ["Alemao", "DE"],
    ];

    for (const [nome, sigla] of idiomas) {
      await pool.query(
        "INSERT IGNORE INTO Idioma (nome, sigla) VALUES (?, ?)",
        [nome, sigla]
      );
    }
    console.log("Idiomas seedados.");

    const tecnologias: [string, string][] = [
      ["React", "tech"],
      ["Java", "tech"],
      ["Python", "tech"],
      ["TypeScript", "tech"],
      ["Next.js", "tech"],
      ["Node.js", "tech"],
      ["AWS", "tech"],
      ["Docker", "tech"],
      ["Kubernetes", "tech"],
      ["Laravel", "tech"],
      ["MySQL", "tech"],
      ["PostgreSQL", "tech"],
      ["Power Automate", "ferramenta"],
      ["Scrum", "ferramenta"],
      ["Kanban", "ferramenta"],
      ["React Native", "tech"],
      ["Go", "tech"],
      ["C#", "tech"],
      ["Azure", "tech"],
      ["Terraform", "ferramenta"],
    ];

    for (const [nome, categoria] of tecnologias) {
      await pool.query(
        "INSERT IGNORE INTO Tecnologia (nome, categoria) VALUES (?, ?)",
        [nome, categoria]
      );
    }
    console.log("Tecnologias seedadas.");

    // ============================================================
    // Helper: create a full mentor
    // ============================================================
    async function createMentor(opts: {
      cpf: string;
      nome: string;
      email: string;
      cargo: string;
      empresa: string | null;
      descricao: string;
      experiencia: string | null;
      preco: number;
      idiomas: number[];
      tecnologias: number[];
      disponibilidade: { dia: number; inicio: string; fim: string; plataformas: string }[];
      rating?: number;
      totalAvaliacoes?: number;
    }) {
      const [exists] = await pool.query(
        "SELECT usuario_id FROM Usuario WHERE email = ?",
        [opts.email]
      );
      if ((exists as any[]).length > 0) {
        console.log(`Ja existe: ${opts.email}`);
        return;
      }

      const [r] = await pool.query(
        `INSERT INTO Usuario (cpf, nome, email, telefone, senha_hash, is_aluno, is_mentor, perfil_mentor_completo, is_admin)
         VALUES (?, ?, ?, '11999990000', ?, 1, 1, 1, 0)`,
        [opts.cpf, opts.nome, opts.email, hashed]
      );
      const userId = (r as any).insertId;

      await pool.query("INSERT INTO Aluno (usuario_id) VALUES (?)", [userId]);

      const [mentorR] = await pool.query(
        `INSERT INTO Mentor (usuario_id, cargo, empresa, descricao, experiencia_profissional, preco_por_sessao, rating, total_avaliacoes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          opts.cargo,
          opts.empresa,
          opts.descricao,
          opts.experiencia,
          opts.preco,
          opts.rating || 0,
          opts.totalAvaliacoes || 0,
        ]
      );
      const mentorId = (mentorR as any).insertId;

      for (const idiomaId of opts.idiomas) {
        await pool.query(
          "INSERT IGNORE INTO Usuario_Idioma (usuario_id, idioma_id) VALUES (?, ?)",
          [userId, idiomaId]
        );
        await pool.query(
          "INSERT IGNORE INTO Mentor_Idioma (mentor_id, idioma_id) VALUES (?, ?)",
          [mentorId, idiomaId]
        );
      }

      for (const techId of opts.tecnologias) {
        await pool.query(
          "INSERT IGNORE INTO Mentor_Tecnologia (mentor_id, tecnologia_id) VALUES (?, ?)",
          [mentorId, techId]
        );
      }

      for (const disp of opts.disponibilidade) {
        await pool.query(
          `INSERT INTO Disponibilidade (mentor_id, dia_semana, hora_inicio, hora_fim, ativo, plataformas_video)
           VALUES (?, ?, ?, ?, 1, ?)`,
          [mentorId, disp.dia, disp.inicio, disp.fim, disp.plataformas]
        );
      }

      console.log(`Mentor criado: ${opts.nome} (id=${mentorId})`);
    }

    // ============================================================
    // Seed mentor@mentor.com test user
    // ============================================================
    await createMentor({
      cpf: "11122233344",
      nome: "Mentor Teste",
      email: "mentor@mentor.com",
      cargo: "Desenvolvedor Full Stack",
      empresa: "TechCorp",
      descricao: "Desenvolvedor senior com 10 anos de experiencia em desenvolvimento web e mobile. Especialista em React, Node.js e arquitetura de microsservicos.",
      experiencia: "10+ anos de experiencia em empresas de tecnologia como TechCorp e StartupXYZ. Lider de equipe em projetos de grande escala.",
      preco: 150.0,
      rating: 4.7,
      totalAvaliacoes: 23,
      idiomas: [1, 2], // PT, EN
      tecnologias: [1, 2, 4], // React, Java, TypeScript
      disponibilidade: [
        { dia: 1, inicio: "09:00:00", fim: "12:00:00", plataformas: "google_meet,microsoft_teams" },
        { dia: 1, inicio: "14:00:00", fim: "18:00:00", plataformas: "google_meet,zoom" },
        { dia: 3, inicio: "09:00:00", fim: "12:00:00", plataformas: "google_meet" },
        { dia: 3, inicio: "14:00:00", fim: "17:00:00", plataformas: "google_meet,microsoft_teams,zoom" },
        { dia: 5, inicio: "10:00:00", fim: "14:00:00", plataformas: "zoom,discord" },
      ],
    });

    // ============================================================
    // Seed student test
    // ============================================================
    const [existingStudent] = await pool.query(
      "SELECT usuario_id FROM Usuario WHERE email = ?",
      ["teste@teste.com"]
    );
    if ((existingStudent as any[]).length === 0) {
      const [r] = await pool.query(
        `INSERT INTO Usuario (cpf, nome, email, telefone, senha_hash, is_aluno, is_mentor, perfil_mentor_completo)
         VALUES ('52998224725', 'Usuario Teste', 'teste@teste.com', '11999990000', ?, 1, 0, 0)`,
        [hashed]
      );
      const userId = (r as any).insertId;
      await pool.query("INSERT INTO Aluno (usuario_id) VALUES (?)", [userId]);
      await pool.query("INSERT IGNORE INTO Usuario_Idioma (usuario_id, idioma_id) VALUES (?, 1)", [userId]);
      console.log("Aluno teste criado.");
    } else {
      console.log("Aluno teste ja existe.");
    }

    // ============================================================
    // Seed admin user
    // ============================================================
    const [existingAdmin] = await pool.query(
      "SELECT usuario_id FROM Usuario WHERE email = ?",
      ["admin@mockmentor.com"]
    );

    if ((existingAdmin as any[]).length === 0) {
      const [r] = await pool.query(
        `INSERT INTO Usuario (cpf, nome, email, telefone, senha_hash, is_aluno, is_mentor, is_admin, perfil_mentor_completo)
         VALUES ('00000000000', 'Administrador', 'admin@mockmentor.com', '11999990000', ?, 1, 1, 1, 1)`,
        [hashed]
      );
      console.log("Admin criado.");
    } else {
      console.log("Admin ja existe.");
    }

    // ============================================================
    // Seed new mentors
    // ============================================================
    await createMentor({
      cpf: "12345678901",
      nome: "Ana Beatriz Silva",
      email: "ana@mentor.com",
      cargo: "Frontend Engineer",
      empresa: "Spotify",
      descricao: "Engenheira frontend apaixonada por interfaces acessíveis e performáticas. 7 anos de experiência com React, TypeScript e design systems. Já trabalhou em produtos com milhões de usuários ativos.",
      experiencia: "5 anos na Spotify liderando o time de Frontend. Anteriormente na VTEX e Nubank. Contribuidora ativa de projetos open-source.",
      preco: 120.0,
      rating: 4.8,
      totalAvaliacoes: 31,
      idiomas: [1, 2, 3], // PT, EN, ES
      tecnologias: [1, 4, 5, 16], // React, TypeScript, Next.js, React Native
      disponibilidade: [
        { dia: 1, inicio: "10:00:00", fim: "13:00:00", plataformas: "google_meet,zoom" },
        { dia: 1, inicio: "15:00:00", fim: "18:00:00", plataformas: "google_meet" },
        { dia: 3, inicio: "10:00:00", fim: "12:00:00", plataformas: "google_meet,microsoft_teams" },
        { dia: 5, inicio: "09:00:00", fim: "12:00:00", plataformas: "zoom,discord" },
        { dia: 5, inicio: "14:00:00", fim: "17:00:00", plataformas: "google_meet,zoom" },
      ],
    });

    await createMentor({
      cpf: "98765432100",
      nome: "Carlos Eduardo Souza",
      email: "carlos@mentor.com",
      cargo: "Backend Engineer",
      empresa: "Nubank",
      descricao: "Engenheiro backend focado em sistemas distribuídos de alta disponibilidade. Especialista em Java, Python e arquiteturas baseadas em eventos. Apaixonado por código limpo e testes automatizados.",
      experiencia: "8 anos no Nubank construindo APIs que processam milhões de transações diárias. Experiência com Kafka, Redis e microserviços.",
      preco: 180.0,
      rating: 4.6,
      totalAvaliacoes: 18,
      idiomas: [1, 2], // PT, EN
      tecnologias: [2, 3, 7, 10, 11], // Java, Python, AWS, Laravel, MySQL
      disponibilidade: [
        { dia: 2, inicio: "09:00:00", fim: "12:00:00", plataformas: "google_meet,microsoft_teams" },
        { dia: 2, inicio: "14:00:00", fim: "17:00:00", plataformas: "zoom" },
        { dia: 4, inicio: "09:00:00", fim: "12:00:00", plataformas: "google_meet" },
        { dia: 4, inicio: "15:00:00", fim: "18:00:00", plataformas: "google_meet,microsoft_teams,zoom" },
        { dia: 6, inicio: "10:00:00", fim: "13:00:00", plataformas: "discord" },
      ],
    });

    await createMentor({
      cpf: "45678912300",
      nome: "Mariana Lima Costa",
      email: "mariana@mentor.com",
      cargo: "Product Manager",
      empresa: "iFood",
      descricao: "Product Manager com foco em produtos de marketplace e crescimento. Sólida experiência em discovery, métricas de produto e trabalho cross-functional com times de engenharia e design.",
      experiencia: "6 anos no iFood gerenciando produtos de delivery e payments. Anteriormente na Loft e Resultados Digitais. MBA pela FGV.",
      preco: 200.0,
      rating: 4.9,
      totalAvaliacoes: 42,
      idiomas: [1, 2], // PT, EN
      tecnologias: [13, 14, 15], // Power Automate, Scrum, Kanban
      disponibilidade: [
        { dia: 1, inicio: "08:00:00", fim: "11:00:00", plataformas: "google_meet,microsoft_teams" },
        { dia: 3, inicio: "13:00:00", fim: "16:00:00", plataformas: "google_meet" },
        { dia: 5, inicio: "08:00:00", fim: "11:00:00", plataformas: "zoom,microsoft_teams" },
      ],
    });

    await createMentor({
      cpf: "78912345600",
      nome: "Rafael Oliveira",
      email: "rafael@mentor.com",
      cargo: "Cloud Architect",
      empresa: "Stone",
      descricao: "Arquiteto de nuvem certificado AWS e GCP. Especialista em infraestrutura como código, DevOps e arquiteturas serverless. Focado em custo-eficiência e resiliência.",
      experiencia: "10 anos de experiência em infraestrutura e cloud. 5 anos na Stone liderando a migração para AWS. Certificações: AWS Solutions Architect Professional, Terraform Associate.",
      preco: 250.0,
      rating: 4.2,
      totalAvaliacoes: 12,
      idiomas: [1, 2], // PT, EN
      tecnologias: [7, 8, 9, 19, 20], // AWS, Docker, Kubernetes, Azure, Terraform
      disponibilidade: [
        { dia: 2, inicio: "08:00:00", fim: "11:00:00", plataformas: "google_meet" },
        { dia: 4, inicio: "10:00:00", fim: "13:00:00", plataformas: "google_meet,zoom" },
        { dia: 6, inicio: "09:00:00", fim: "12:00:00", plataformas: "discord,google_meet" },
      ],
    });

    // ============================================================
    // Seed real reviews (Avaliacao_Mentor)
    // ============================================================
    const [alunoRow] = await pool.query<RowDataPacket[]>(
      "SELECT aluno_id FROM Aluno WHERE usuario_id = (SELECT usuario_id FROM Usuario WHERE email = ?)",
      ["teste@teste.com"]
    );

    if ((alunoRow as any[]).length > 0) {
      const alunoId = (alunoRow as any[])[0].aluno_id;

      // Check if reviews already exist
      const [existingReviews] = await pool.query<RowDataPacket[]>(
        "SELECT COUNT(*) AS cnt FROM Avaliacao_Mentor WHERE aluno_id = ?",
        [alunoId]
      );

      if ((existingReviews as any[])[0].cnt === 0) {
        const reviews = [
          { mentorId: 2, nota: 4.7, titulo: "Excelente mentor", comentario: "Muito paciente e conhecimento profundo. As sessões me ajudaram muito na preparação para entrevistas." },
          { mentorId: 2, nota: 4.8, titulo: "Melhor mentoria de Frontend", comentario: "Ana explicou conceitos de React de forma clara e prática. Recomendo demais!" },
          { mentorId: 2, nota: 4.9, titulo: "Vale cada centavo", comentario: "Consegui uma vaga de Frontend depois das sessões com a Ana. Ajudou muito no portfólio." },
          { mentorId: 3, nota: 4.5, titulo: "Ótimo para Java e System Design", comentario: "Carlos tem um conhecimento absurdo de arquitetura. As sessões foram muito produtivas." },
          { mentorId: 3, nota: 4.7, titulo: "Mentoria top", comentario: "Me ajudou a entender microsservicos e boas práticas em Java. Super recomendo." },
          { mentorId: 4, nota: 4.9, titulo: "Visão de produto incomparável", comentario: "Mariana mudou minha forma de pensar sobre produto. Aulas incríveis!" },
          { mentorId: 4, nota: 5.0, titulo: "Incrível", comentario: "As dicas de Discovery e métricas de produto já fizeram diferença no meu trabalho." },
          { mentorId: 5, nota: 4.2, titulo: "Bom para cloud", comentario: "Rafael tem bastante experiência com AWS. As sessões são práticas e diretas." },
        ];

        for (const r of reviews) {
          await pool.query(
            `INSERT INTO Avaliacao_Mentor (mentor_id, aluno_id, nota, titulo, comentario)
             VALUES (?, ?, ?, ?, ?)`,
            [r.mentorId, alunoId, r.nota, r.titulo, r.comentario]
          );
        }

        // Update Mentor rating and total_avaliacoes from real data
        for (const mentorId of [2, 3, 4, 5]) {
          await pool.query(
            `UPDATE Mentor SET
               rating = COALESCE((SELECT AVG(nota) FROM Avaliacao_Mentor WHERE mentor_id = ?), 0),
               total_avaliacoes = (SELECT COUNT(*) FROM Avaliacao_Mentor WHERE mentor_id = ?)
             WHERE mentor_id = ?`,
            [mentorId, mentorId, mentorId]
          );
        }

        console.log("Reviews criados com sucesso.");
      } else {
        console.log("Reviews ja existem.");
      }
    }

    console.log("\nSeed completo!");
    console.log("================================");
    console.log("Credenciais de teste:");
    console.log("Aluno:   teste@teste.com / 123456");
    console.log("Mentor:  mentor@mentor.com / 123456");
    console.log("Admin:   admin@mockmentor.com / 123456");
    console.log("Ana:     ana@mentor.com / 123456");
    console.log("Carlos:  carlos@mentor.com / 123456");
    console.log("Mariana: mariana@mentor.com / 123456");
    console.log("Rafael:  rafael@mentor.com / 123456");
    console.log("================================");
  } catch (err: any) {
    console.error("Erro:", err.message);
    console.error(err.stack);
  }
}

async function seed() {
  const pool = await getPool();
  try {
    await seedData(pool);
  } finally {
    await pool.end();
  }
}

seed();
