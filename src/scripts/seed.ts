import mysql, { type RowDataPacket } from "mysql2/promise";
import { hash } from "bcryptjs";

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "root",
    database: process.env.DATABASE_NAME || "mock_mentor",
  });

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
    // Helper: create a full tutor
    // ============================================================
    async function createTutor(opts: {
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
        `INSERT INTO Usuario (cpf, nome, email, telefone, senha_hash, is_aluno, is_tutor, perfil_mentor_completo)
         VALUES (?, ?, ?, '11999990000', ?, 1, 1, 1)`,
        [opts.cpf, opts.nome, opts.email, hashed]
      );
      const userId = (r as any).insertId;

      await pool.query("INSERT INTO Aluno (usuario_id) VALUES (?)", [userId]);

      const [tutorR] = await pool.query(
        `INSERT INTO Tutor (usuario_id, cargo, empresa, descricao, experiencia_profissional, preco_por_sessao, rating, total_avaliacoes)
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
      const tutorId = (tutorR as any).insertId;

      for (const idiomaId of opts.idiomas) {
        await pool.query(
          "INSERT IGNORE INTO Usuario_Idioma (usuario_id, idioma_id) VALUES (?, ?)",
          [userId, idiomaId]
        );
        await pool.query(
          "INSERT IGNORE INTO Tutor_Idioma (tutor_id, idioma_id) VALUES (?, ?)",
          [tutorId, idiomaId]
        );
      }

      for (const techId of opts.tecnologias) {
        await pool.query(
          "INSERT IGNORE INTO Tutor_Tecnologia (tutor_id, tecnologia_id) VALUES (?, ?)",
          [tutorId, techId]
        );
      }

      for (const disp of opts.disponibilidade) {
        await pool.query(
          `INSERT INTO Disponibilidade (tutor_id, dia_semana, hora_inicio, hora_fim, ativo, plataformas_video)
           VALUES (?, ?, ?, ?, 1, ?)`,
          [tutorId, disp.dia, disp.inicio, disp.fim, disp.plataformas]
        );
      }

      console.log(`Tutor criado: ${opts.nome} (id=${tutorId})`);
    }

    // ============================================================
    // Seed existing mentor test (fix FK bug)
    // ============================================================
    const [existingMentor] = await pool.query(
      "SELECT usuario_id FROM Usuario WHERE email = ?",
      ["mentor@mentor.com"]
    );

    if ((existingMentor as any[]).length > 0) {
      const userId = (existingMentor as any[])[0].usuario_id;
      const [tutorRows] = await pool.query(
        "SELECT tutor_id FROM Tutor WHERE usuario_id = ?",
        [userId]
      );

      if ((tutorRows as any[]).length > 0) {
        const tutorId = (tutorRows as any[])[0].tutor_id;

        // Fix FK: Tutor_Idioma and Tutor_Tecnologia should use tutor_id
        await pool.query("DELETE FROM Tutor_Idioma WHERE tutor_id = ?", [tutorId]);
        await pool.query("DELETE FROM Tutor_Tecnologia WHERE tutor_id = ?", [tutorId]);

        // Re-insert with correct tutor_id
        await pool.query("INSERT IGNORE INTO Tutor_Idioma (tutor_id, idioma_id) VALUES (?, 1)", [tutorId]);
        await pool.query("INSERT IGNORE INTO Tutor_Idioma (tutor_id, idioma_id) VALUES (?, 2)", [tutorId]);
        await pool.query("INSERT IGNORE INTO Tutor_Tecnologia (tutor_id, tecnologia_id) VALUES (?, 1)", [tutorId]); // React
        await pool.query("INSERT IGNORE INTO Tutor_Tecnologia (tutor_id, tecnologia_id) VALUES (?, 2)", [tutorId]); // Java
        await pool.query("INSERT IGNORE INTO Tutor_Tecnologia (tutor_id, tecnologia_id) VALUES (?, 4)", [tutorId]); // TypeScript

        // Update rating and info
        await pool.query(
          "UPDATE Tutor SET cargo = 'Desenvolvedor Full Stack', empresa = 'TechCorp', descricao = 'Desenvolvedor senior com 10 anos de experiencia em desenvolvimento web e mobile. Especialista em React, Node.js e arquitetura de microsservicos.', experiencia_profissional = '10+ anos de experiencia em empresas de tecnologia como TechCorp e StartupXYZ. Lider de equipe em projetos de grande escala.', preco_por_sessao = 150.00, rating = 4.7, total_avaliacoes = 23 WHERE tutor_id = ?",
          [tutorId]
        );

        // Add availability
        await pool.query("DELETE FROM Disponibilidade WHERE tutor_id = ?", [tutorId]);
        const slots = [
          [1, "09:00:00", "12:00:00", "google_meet,microsoft_teams"],
          [1, "14:00:00", "18:00:00", "google_meet,zoom"],
          [3, "09:00:00", "12:00:00", "google_meet"],
          [3, "14:00:00", "17:00:00", "google_meet,microsoft_teams,zoom"],
          [5, "10:00:00", "14:00:00", "zoom,discord"],
        ];
        for (const [dia, inicio, fim, plataformas] of slots) {
          await pool.query(
            "INSERT INTO Disponibilidade (tutor_id, dia_semana, hora_inicio, hora_fim, ativo, plataformas_video) VALUES (?, ?, ?, ?, 1, ?)",
            [tutorId, dia, inicio, fim, plataformas]
          );
        }

        console.log("Mentor teste atualizado com dados completos.");
      }
    }

    // ============================================================
    // Seed student test
    // ============================================================
    const [existingStudent] = await pool.query(
      "SELECT usuario_id FROM Usuario WHERE email = ?",
      ["teste@teste.com"]
    );
    if ((existingStudent as any[]).length === 0) {
      const [r] = await pool.query(
        `INSERT INTO Usuario (cpf, nome, email, telefone, senha_hash, is_aluno, is_tutor, perfil_mentor_completo)
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
    // Seed new mentors
    // ============================================================
    await createTutor({
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

    await createTutor({
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

    await createTutor({
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

    await createTutor({
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
    // Seed real reviews (Avaliacao_Tutor)
    // ============================================================
    const [alunoRow] = await pool.query<RowDataPacket[]>(
      "SELECT aluno_id FROM Aluno WHERE usuario_id = (SELECT usuario_id FROM Usuario WHERE email = ?)",
      ["teste@teste.com"]
    );

    if ((alunoRow as any[]).length > 0) {
      const alunoId = (alunoRow as any[])[0].aluno_id;

      // Check if reviews already exist
      const [existingReviews] = await pool.query<RowDataPacket[]>(
        "SELECT COUNT(*) AS cnt FROM Avaliacao_Tutor WHERE aluno_id = ?",
        [alunoId]
      );

      if ((existingReviews as any[])[0].cnt === 0) {
        const reviews = [
          { tutorId: 1, nota: 4.7, titulo: "Excelente mentor", comentario: "Muito paciente e conhecimento profundo. As sessões me ajudaram muito na preparação para entrevistas." },
          { tutorId: 3, nota: 4.8, titulo: "Melhor mentoria de Frontend", comentario: "Ana explicou conceitos de React de forma clara e prática. Recomendo demais!" },
          { tutorId: 3, nota: 4.9, titulo: " Vale cada centavo", comentario: "Consegui uma vaga de Frontend depois das sessões com a Ana. Ajudou muito no portfólio." },
          { tutorId: 4, nota: 4.5, titulo: "Ótimo para Java e System Design", comentario: "Carlos tem um conhecimento absurdo de arquitetura. As sessões foram muito produtivas." },
          { tutorId: 4, nota: 4.7, titulo: "Mentoria top", comentario: "Me ajudou a entender microsservicos e boas práticas em Java. Super recomendo." },
          { tutorId: 5, nota: 4.9, titulo: "Visão de produto incomparável", comentario: "Mariana mudou minha forma de pensar sobre produto. Aulas incríveis!" },
          { tutorId: 5, nota: 5.0, titulo: "Incrível", comentario: "As dicas de Discovery e métricas de produto já fizeram diferença no meu trabalho." },
          { tutorId: 6, nota: 4.2, titulo: "Bom para cloud", comentario: "Rafael tem bastante experiência com AWS. As sessões são práticas e diretas." },
        ];

        for (const r of reviews) {
          await pool.query(
            `INSERT INTO Avaliacao_Tutor (tutor_id, aluno_id, nota, titulo, comentario)
             VALUES (?, ?, ?, ?, ?)`,
            [r.tutorId, alunoId, r.nota, r.titulo, r.comentario]
          );
        }

        // Update Tutor rating and total_avaliacoes from real data
        for (const tutorId of [1, 3, 4, 5, 6]) {
          await pool.query(
            `UPDATE Tutor SET
               rating = COALESCE((SELECT AVG(nota) FROM Avaliacao_Tutor WHERE tutor_id = ?), 0),
               total_avaliacoes = (SELECT COUNT(*) FROM Avaliacao_Tutor WHERE tutor_id = ?)
             WHERE tutor_id = ?`,
            [tutorId, tutorId, tutorId]
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
    console.log("Ana:     ana@mentor.com / 123456");
    console.log("Carlos:  carlos@mentor.com / 123456");
    console.log("Mariana: mariana@mentor.com / 123456");
    console.log("Rafael:  rafael@mentor.com / 123456");
    console.log("================================");
  } catch (err: any) {
    console.error("Erro:", err.message);
    console.error(err.stack);
  } finally {
    await pool.end();
  }
}

seed();
