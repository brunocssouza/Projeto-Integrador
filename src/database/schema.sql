-- ============================================================
-- Mock Mentor - MySQL Schema (v3 - Completo)
-- MySQL 8.0+ / MariaDB 10.6+
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 1. USUARIO
--    Tabela base. Um usuario pode ser Aluno, Mentor, ou ambos.
--    CPF obrigatorio (validacao brasileira).
--    Duas senhas para os dois modos? Nao - mesma conta, mesma senha.
--    perfil_mentor_completo indica se ja preencheu dados de mentor.
-- ============================================================
CREATE TABLE Usuario (
    usuario_id              INT             AUTO_INCREMENT PRIMARY KEY,
    cpf                     CHAR(11)        NOT NULL                COMMENT 'Somente digitos, 11 chars',
    nome                    VARCHAR(120)    NOT NULL,
    email                   VARCHAR(255)    NOT NULL,
    telefone                VARCHAR(20)     NOT NULL,
    senha_hash              VARCHAR(255)    NOT NULL                COMMENT 'bcrypt hash',
    avatar_url              VARCHAR(512)    DEFAULT NULL,
    is_aluno                TINYINT(1)      NOT NULL DEFAULT 1,
    is_mentor                TINYINT(1)      NOT NULL DEFAULT 0,
    perfil_mentor_completo  TINYINT(1)      NOT NULL DEFAULT 0     COMMENT '0 = precisa setup de mentor',
    criado_em               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                            ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_usuario_email (email),
    UNIQUE KEY uq_usuario_cpf   (cpf),

    CONSTRAINT chk_cpf_length
        CHECK (CHAR_LENGTH(cpf) = 11)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 2. IDIOMA
--    Catalogo de idiomas disponiveis na plataforma.
-- ============================================================
CREATE TABLE Idioma (
    idioma_id   INT             AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(60)     NOT NULL,
    sigla       CHAR(2)         NOT NULL                COMMENT 'PT, EN, ES, FR...',

    UNIQUE KEY uq_idioma_sigla (sigla)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 3. USUARIO_IDIOMA
--    Quais idiomas o usuario domina (N:N).
--    Util para o aluno filtrar mentores por idioma de aula.
-- ============================================================
CREATE TABLE Usuario_Idioma (
    usuario_id  INT NOT NULL,
    idioma_id   INT NOT NULL,

    PRIMARY KEY (usuario_id, idioma_id),

    CONSTRAINT fk_ui_usuario
        FOREIGN KEY (usuario_id) REFERENCES Usuario (usuario_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ui_idioma
        FOREIGN KEY (idioma_id) REFERENCES Idioma (idioma_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 4. ALUNO
--    Dados especificos do modo aluno (1:1 com Usuario).
-- ============================================================
CREATE TABLE Aluno (
    aluno_id            INT             AUTO_INCREMENT PRIMARY KEY,
    usuario_id          INT             NOT NULL,
    formacao_academica  VARCHAR(120)    DEFAULT NULL,

    UNIQUE KEY uq_aluno_usuario (usuario_id),

    CONSTRAINT fk_aluno_usuario
        FOREIGN KEY (usuario_id) REFERENCES Usuario (usuario_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 5. MENTOR (MENTOR)
--    Dados especificos do modo mentor (1:1 com Usuario).
--    rating, total_avaliacoes e preco_por_sessao para queries
--    rapidas no explore / perfil.
-- ============================================================
CREATE TABLE Mentor (
    mentor_id                    INT             AUTO_INCREMENT PRIMARY KEY,
    usuario_id                  INT             NOT NULL,
    cargo                       VARCHAR(120)    NOT NULL                COMMENT 'ex: Backend Engineer',
    empresa                     VARCHAR(120)    DEFAULT NULL,
    descricao                   TEXT            NOT NULL,
    experiencia_profissional    TEXT            DEFAULT NULL,
    preco_por_sessao            DECIMAL(10,2)   NOT NULL DEFAULT 0.00
                                                        COMMENT 'Valor em BRL',
    rating                      DECIMAL(2,1)    NOT NULL DEFAULT 0.0
                                                         COMMENT 'Media 1.0 a 5.0',
    total_avaliacoes            INT UNSIGNED    NOT NULL DEFAULT 0,
    video_apresentacao_url      VARCHAR(512)    DEFAULT NULL
                                                         COMMENT 'URL do video de apresentacao (YouTube, Vimeo)',

    UNIQUE KEY uq_mentor_usuario (usuario_id),

    CONSTRAINT chk_mentor_rating
        CHECK (rating BETWEEN 0.0 AND 5.0),
    CONSTRAINT chk_mentor_preco
        CHECK (preco_por_sessao >= 0),

    CONSTRAINT fk_mentor_usuario
        FOREIGN KEY (usuario_id) REFERENCES Usuario (usuario_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 6. MENTOR_IDIOMA
--    Idiomas em que o mentor pode dar aula (N:N).
-- ============================================================
CREATE TABLE Mentor_Idioma (
    mentor_id    INT NOT NULL,
    idioma_id   INT NOT NULL,

    PRIMARY KEY (mentor_id, idioma_id),

    CONSTRAINT fk_ti_mentor
        FOREIGN KEY (mentor_id) REFERENCES Mentor (mentor_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ti_idioma
        FOREIGN KEY (idioma_id) REFERENCES Idioma (idioma_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 7. TECNOLOGIA
--    Catalogo de tecnologias / ferramentas / areas de atuacao.
-- ============================================================
CREATE TABLE Tecnologia (
    tecnologia_id   INT             AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(80)     NOT NULL,
    categoria       ENUM('tech', 'ferramenta', 'area_direito', 'soft_skill')
                                    NOT NULL DEFAULT 'tech',

    UNIQUE KEY uq_tecnologia_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 8. MENTOR_TECNOLOGIA
--    Quais tecnologias cada mentor domina (N:N).
-- ============================================================
CREATE TABLE Mentor_Tecnologia (
    mentor_id        INT NOT NULL,
    tecnologia_id   INT NOT NULL,

    PRIMARY KEY (mentor_id, tecnologia_id),

    CONSTRAINT fk_tt_mentor
        FOREIGN KEY (mentor_id) REFERENCES Mentor (mentor_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tt_tecnologia
        FOREIGN KEY (tecnologia_id) REFERENCES Tecnologia (tecnologia_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 9. DISPONIBILIDADE
--    Horarios em que o mentor esta disponivel para sessoes.
--    Permite configurar recurrence semanal.
-- ============================================================
CREATE TABLE Disponibilidade (
    disponibilidade_id  INT             AUTO_INCREMENT PRIMARY KEY,
    mentor_id            INT             NOT NULL,
    dia_semana          TINYINT UNSIGNED NOT NULL
                                        COMMENT '0=Domingo .. 6=Sabado',
    hora_inicio         TIME            NOT NULL,
    hora_fim            TIME            NOT NULL,
    ativo               TINYINT(1)      NOT NULL DEFAULT 1,
    plataformas_video   SET('google_meet','microsoft_teams','zoom','discord')
                                        DEFAULT NULL
                                        COMMENT 'Plataformas de videoaceita neste horario',

    INDEX idx_disp_mentor (mentor_id),
    INDEX idx_disp_dia   (dia_semana),

    CONSTRAINT chk_dia_semana
        CHECK (dia_semana BETWEEN 0 AND 6),
    CONSTRAINT chk_hora_range
        CHECK (hora_inicio < hora_fim),

    CONSTRAINT fk_disp_mentor
        FOREIGN KEY (mentor_id) REFERENCES Mentor (mentor_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 10. SESSAO
--     Sessao de simulado / entrevista entre aluno e mentor.
-- ============================================================
CREATE TABLE Sessao (
    sessao_id           INT             AUTO_INCREMENT PRIMARY KEY,
    aluno_id            INT             NOT NULL,
    mentor_id            INT             NOT NULL,
    titulo              VARCHAR(200)    NOT NULL,
    area                VARCHAR(100)    NOT NULL,
    data_hora           TIMESTAMP       NOT NULL,
    duracao_min         SMALLINT UNSIGNED NOT NULL DEFAULT 60,
    status              ENUM('agendada', 'em_andamento', 'concluida', 'cancelada')
                                        NOT NULL DEFAULT 'agendada',
    status_reserva      ENUM('pendente', 'aprovada', 'recusada')
                                        NOT NULL DEFAULT 'pendente'
                                        COMMENT 'Fluxo de aprovacao do mentor',
    plataforma_video    ENUM('google_meet', 'microsoft_teams', 'zoom', 'discord')
                                        DEFAULT NULL,
    link_reuniao        VARCHAR(512)    DEFAULT NULL,
    joined_aluno_at     TIMESTAMP       NULL DEFAULT NULL
                                        COMMENT 'Horario em que o aluno entrou na call',
    joined_mentor_at     TIMESTAMP       NULL DEFAULT NULL
                                        COMMENT 'Horario em que o mentor entrou na call',
    cancelado_por       INT             DEFAULT NULL
                                        COMMENT 'usuario_id de quem cancelou',
    motivo_cancelamento VARCHAR(300)    DEFAULT NULL,
    criado_em           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_sessao_aluno   (aluno_id),
    INDEX idx_sessao_mentor   (mentor_id),
    INDEX idx_sessao_data    (data_hora),
    INDEX idx_sessao_status  (status),
    INDEX idx_sessao_reserva (status_reserva),

    CONSTRAINT fk_sessao_aluno
        FOREIGN KEY (aluno_id) REFERENCES Aluno (aluno_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sessao_mentor
        FOREIGN KEY (mentor_id) REFERENCES Mentor (mentor_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 11. FEEDBACK
--     Avaliacao numerica (1-10) da sessao.
-- ============================================================
CREATE TABLE Feedback (
    feedback_id                 INT             AUTO_INCREMENT PRIMARY KEY,
    sessao_id                   INT             NOT NULL,
    avaliacao_tecnica           TINYINT UNSIGNED NOT NULL COMMENT '1-10',
    avaliacao_comportamental    TINYINT UNSIGNED NOT NULL COMMENT '1-10',
    sugestao_melhoria           TEXT            DEFAULT NULL,
    criado_em                   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_feedback_sessao (sessao_id),

    CONSTRAINT chk_fb_tecnica
        CHECK (avaliacao_tecnica BETWEEN 1 AND 10),
    CONSTRAINT chk_fb_comportamental
        CHECK (avaliacao_comportamental BETWEEN 1 AND 10),

    CONSTRAINT fk_feedback_sessao
        FOREIGN KEY (sessao_id) REFERENCES Sessao (sessao_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 12. AVALIACAO_MENTOR
--     Reviews publicos de alunos sobre mentores.
--     Diferente do Feedback (que e por sessao) - este e sobre
--     o mentor como um todo, e o que aparece no perfil dele.
-- ============================================================
CREATE TABLE Avaliacao_Mentor (
    avaliacao_id    INT             AUTO_INCREMENT PRIMARY KEY,
    mentor_id        INT             NOT NULL,
    aluno_id        INT             NOT NULL,
    nota            DECIMAL(2,1)    NOT NULL                COMMENT '1.0 - 5.0',
    titulo          VARCHAR(120)    DEFAULT NULL,
    comentario      TEXT            DEFAULT NULL,
    criado_em       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_avt_mentor  (mentor_id),
    INDEX idx_avt_aluno  (aluno_id),
    INDEX idx_avt_nota   (nota),

    CONSTRAINT chk_avt_nota
        CHECK (nota BETWEEN 1.0 AND 5.0),

    CONSTRAINT fk_avt_mentor
        FOREIGN KEY (mentor_id) REFERENCES Mentor (mentor_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_avt_aluno
        FOREIGN KEY (aluno_id) REFERENCES Aluno (aluno_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 13. PAGAMENTO
-- ============================================================
CREATE TABLE Pagamento (
    pagamento_id        INT             AUTO_INCREMENT PRIMARY KEY,
    sessao_id           INT             NOT NULL,
    valor               DECIMAL(10,2)   NOT NULL COMMENT 'Valor em BRL',
    forma_pagamento     ENUM('cartao_credito', 'cartao_debito', 'pix', 'boleto', 'gratuito')
                                        NOT NULL DEFAULT 'pix',
    status              ENUM('pendente', 'pago', 'estornado', 'cancelado')
                                        NOT NULL DEFAULT 'pendente',
    pago_em             TIMESTAMP       NULL DEFAULT NULL,
    criado_em           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_pagamento_sessao  (sessao_id),
    INDEX idx_pagamento_status  (status),

    CONSTRAINT chk_pagamento_valor
        CHECK (valor >= 0),

    CONSTRAINT fk_pagamento_sessao
        FOREIGN KEY (sessao_id) REFERENCES Sessao (sessao_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 14. HABILIDADE
--     Categorias de habilidade rastreadas no dashboard aluno.
-- ============================================================
CREATE TABLE Habilidade (
    habilidade_id   INT             AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(80)     NOT NULL,

    UNIQUE KEY uq_habilidade_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 15. PROGRESSO_HABILIDADE
--     Historico de nivel do aluno (grafico de evolucao).
-- ============================================================
CREATE TABLE Progresso_Habilidade (
    progresso_id    INT             AUTO_INCREMENT PRIMARY KEY,
    aluno_id        INT             NOT NULL,
    habilidade_id   INT             NOT NULL,
    nivel           TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0-100%',
    registrado_em   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_prog_aluno   (aluno_id),
    INDEX idx_prog_hab     (habilidade_id),
    INDEX idx_prog_data    (registrado_em),

    CONSTRAINT chk_prog_nivel
        CHECK (nivel <= 100),

    CONSTRAINT fk_prog_aluno
        FOREIGN KEY (aluno_id) REFERENCES Aluno (aluno_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_prog_habilidade
        FOREIGN KEY (habilidade_id) REFERENCES Habilidade (habilidade_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 16. ATIVIDADE
--     Timeline de atividades recentes do aluno.
-- ============================================================
CREATE TABLE Atividade (
    atividade_id    INT             AUTO_INCREMENT PRIMARY KEY,
    aluno_id        INT             NOT NULL,
    titulo          VARCHAR(200)    NOT NULL,
    link_detalhes   VARCHAR(512)    DEFAULT NULL,
    tipo            ENUM('feedback', 'conquista', 'integracao', 'desafio', 'outro')
                                    NOT NULL DEFAULT 'outro',
    criado_em       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_ativ_aluno (aluno_id),
    INDEX idx_ativ_data  (criado_em),

    CONSTRAINT fk_ativ_aluno
        FOREIGN KEY (aluno_id) REFERENCES Aluno (aluno_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 17. ENDERECO
-- ============================================================
CREATE TABLE Endereco (
    endereco_id     INT             AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT             NOT NULL,
    cep             CHAR(8)         NOT NULL                COMMENT 'Somente digitos',
    rua             VARCHAR(150)    NOT NULL,
    numero          VARCHAR(10)     NOT NULL,
    complemento     VARCHAR(80)     DEFAULT NULL,
    bairro          VARCHAR(100)    NOT NULL,
    cidade          VARCHAR(100)    NOT NULL,
    estado          CHAR(2)         NOT NULL                COMMENT 'UF: SP, RJ, MG...',
    pais            VARCHAR(60)     NOT NULL DEFAULT 'Brasil',

    INDEX idx_endereco_usuario (usuario_id),

    CONSTRAINT fk_endereco_usuario
        FOREIGN KEY (usuario_id) REFERENCES Usuario (usuario_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
