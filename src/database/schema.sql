-- ============================================================
-- Mock Mentor - MySQL Schema v6 (English)
-- MySQL 8.0+
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 1. USER
-- ============================================================
CREATE TABLE IF NOT EXISTS `user` (
    id                          INT             AUTO_INCREMENT PRIMARY KEY,
    cpf                         CHAR(11)        NOT NULL,
    name                        VARCHAR(120)    NOT NULL,
    email                       VARCHAR(255)    NOT NULL,
    phone                       VARCHAR(20)     NOT NULL,
    password_hash               VARCHAR(255)    NOT NULL,
    avatar_url                  VARCHAR(512)    DEFAULT NULL,
    is_student                  TINYINT(1)      NOT NULL DEFAULT 1,
    is_mentor                   TINYINT(1)      NOT NULL DEFAULT 0,
    is_mentor_profile_complete  TINYINT(1)      NOT NULL DEFAULT 0,
    is_admin                    TINYINT(1)      NOT NULL DEFAULT 0,
    email_verified              TINYINT(1)      NOT NULL DEFAULT 0,
    created_at                  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_user_email (email),
    UNIQUE KEY uq_user_cpf   (cpf),

    CONSTRAINT chk_cpf_length CHECK (CHAR_LENGTH(cpf) = 11)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. LANGUAGE (catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS language (
    id      INT             AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(60)     NOT NULL,
    code    CHAR(2)         NOT NULL,

    UNIQUE KEY uq_language_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. USER_LANGUAGE (N:N)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_language (
    user_id     INT NOT NULL,
    language_id INT NOT NULL,

    PRIMARY KEY (user_id, language_id),

    CONSTRAINT fk_ul_user FOREIGN KEY (user_id)     REFERENCES `user` (id)     ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ul_lang FOREIGN KEY (language_id) REFERENCES language (id)   ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. STUDENT (1:1 with user)
-- ============================================================
CREATE TABLE IF NOT EXISTS student (
    id                  INT             AUTO_INCREMENT PRIMARY KEY,
    user_id             INT             NOT NULL,
    academic_background VARCHAR(120)    DEFAULT NULL,

    UNIQUE KEY uq_student_user (user_id),

    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. MENTOR (1:1 with user)
-- ============================================================
CREATE TABLE IF NOT EXISTS mentor (
    id                      INT             AUTO_INCREMENT PRIMARY KEY,
    user_id                 INT             NOT NULL,
    title                   VARCHAR(120)    NOT NULL,
    company                 VARCHAR(120)    DEFAULT NULL,
    description             TEXT            NOT NULL,
    professional_experience TEXT            DEFAULT NULL,
    price_per_session       DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    rating                  DECIMAL(2,1)    NOT NULL DEFAULT 0.0,
    total_reviews           INT UNSIGNED    NOT NULL DEFAULT 0,
    presentation_video_url  VARCHAR(512)    DEFAULT NULL,
    approved                TINYINT(1)      NOT NULL DEFAULT 0,

    UNIQUE KEY uq_mentor_user (user_id),

    CONSTRAINT chk_mentor_rating CHECK (rating BETWEEN 0.0 AND 5.0),
    CONSTRAINT chk_mentor_price  CHECK (price_per_session >= 0),

    CONSTRAINT fk_mentor_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. MENTOR_LANGUAGE (N:N)
-- ============================================================
CREATE TABLE IF NOT EXISTS mentor_language (
    mentor_id   INT NOT NULL,
    language_id INT NOT NULL,

    PRIMARY KEY (mentor_id, language_id),

    CONSTRAINT fk_ml_mentor FOREIGN KEY (mentor_id)   REFERENCES mentor (id)     ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ml_lang   FOREIGN KEY (language_id) REFERENCES language (id)   ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. TECHNOLOGY (catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS technology (
    id          INT             AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(80)     NOT NULL,
    category    ENUM('tech','tool','law','soft_skill') NOT NULL DEFAULT 'tech',

    UNIQUE KEY uq_technology_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. MENTOR_TECHNOLOGY (N:N)
-- ============================================================
CREATE TABLE IF NOT EXISTS mentor_technology (
    mentor_id       INT NOT NULL,
    technology_id   INT NOT NULL,

    PRIMARY KEY (mentor_id, technology_id),

    CONSTRAINT fk_mt_mentor     FOREIGN KEY (mentor_id)     REFERENCES mentor (id)          ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_mt_technology FOREIGN KEY (technology_id) REFERENCES technology (id)      ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. AVAILABILITY
-- ============================================================
CREATE TABLE IF NOT EXISTS availability (
    id              INT                 AUTO_INCREMENT PRIMARY KEY,
    mentor_id       INT                 NOT NULL,
    day_of_week     TINYINT UNSIGNED    NOT NULL COMMENT '0=Sun..6=Sat',
    start_time      TIME                NOT NULL,
    end_time        TIME                NOT NULL,
    active          TINYINT(1)          NOT NULL DEFAULT 1,
    video_platforms SET('google_meet','microsoft_teams','zoom','discord') DEFAULT NULL,

    INDEX idx_avail_mentor (mentor_id),
    INDEX idx_avail_day    (day_of_week),

    CONSTRAINT chk_day_of_week  CHECK (day_of_week BETWEEN 0 AND 6),
    CONSTRAINT chk_time_range   CHECK (start_time < end_time),

    CONSTRAINT fk_avail_mentor FOREIGN KEY (mentor_id) REFERENCES mentor (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. SESSION
-- ============================================================
CREATE TABLE IF NOT EXISTS session (
    id                  INT                      AUTO_INCREMENT PRIMARY KEY,
    student_id          INT                      NOT NULL,
    mentor_id           INT                      NOT NULL,
    title               VARCHAR(200)             NOT NULL,
    area                VARCHAR(100)             NOT NULL,
    scheduled_at        TIMESTAMP                NOT NULL,
    duration_min        SMALLINT UNSIGNED        NOT NULL DEFAULT 60,
    status              ENUM('scheduled','in_progress','completed','cancelled') NOT NULL DEFAULT 'scheduled',
    reservation_status  ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    video_platform      ENUM('google_meet','microsoft_teams','zoom','discord') DEFAULT NULL,
    meeting_link        VARCHAR(512)             DEFAULT NULL,
    joined_student_at   TIMESTAMP                NULL DEFAULT NULL,
    joined_mentor_at    TIMESTAMP                NULL DEFAULT NULL,
    cancelled_by        INT                      DEFAULT NULL,
    cancellation_reason VARCHAR(300)             DEFAULT NULL,
    payment_status      ENUM('unpaid','pending','paid','refunded') NOT NULL DEFAULT 'unpaid',
    created_at          TIMESTAMP                NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_session_student  (student_id),
    INDEX idx_session_mentor   (mentor_id),
    INDEX idx_session_date     (scheduled_at),
    INDEX idx_session_status   (status),
    INDEX idx_session_reserve  (reservation_status),

    CONSTRAINT fk_session_student FOREIGN KEY (student_id) REFERENCES student (id)   ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_session_mentor  FOREIGN KEY (mentor_id)  REFERENCES mentor (id)    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. PAYMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS payment (
    id                  INT             AUTO_INCREMENT PRIMARY KEY,
    session_id          INT             NOT NULL,
    payer_user_id       INT             NOT NULL,
    amount              DECIMAL(10,2)   NOT NULL,
    method              ENUM('pix','credit_card') NOT NULL DEFAULT 'pix',
    status              ENUM('pending','approved','rejected','refunded') NOT NULL DEFAULT 'pending',
    provider            VARCHAR(30)     DEFAULT 'mercadopago',
    provider_payment_id VARCHAR(100)    DEFAULT NULL,
    pix_qr_code         TEXT            DEFAULT NULL,
    pix_ticket_url      VARCHAR(512)    DEFAULT NULL,
    paid_at             TIMESTAMP       NULL DEFAULT NULL,
    refunded_at         TIMESTAMP       NULL DEFAULT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_payment_session (session_id),
    INDEX idx_payment_status  (status),
    INDEX idx_payment_payer   (payer_user_id),

    CONSTRAINT chk_payment_amount CHECK (amount >= 0),

    CONSTRAINT fk_payment_session FOREIGN KEY (session_id) REFERENCES session (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. MENTOR_REVIEW
-- ============================================================
CREATE TABLE IF NOT EXISTS mentor_review (
    id          INT             AUTO_INCREMENT PRIMARY KEY,
    mentor_id   INT             NOT NULL,
    student_id  INT             NOT NULL,
    rating      DECIMAL(2,1)    NOT NULL,
    title       VARCHAR(120)    DEFAULT NULL,
    comment     TEXT            DEFAULT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_review_mentor   (mentor_id),
    INDEX idx_review_student  (student_id),
    INDEX idx_review_rating   (rating),

    CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1.0 AND 5.0),

    CONSTRAINT fk_review_mentor  FOREIGN KEY (mentor_id)  REFERENCES mentor (id)     ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_review_student FOREIGN KEY (student_id) REFERENCES student (id)    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. FEEDBACK (mentor -> student)
-- ============================================================
CREATE TABLE IF NOT EXISTS feedback (
    id                      INT                 AUTO_INCREMENT PRIMARY KEY,
    session_id              INT                 NOT NULL,
    technical_rating        TINYINT UNSIGNED    NOT NULL COMMENT '1-10',
    behavioral_rating       TINYINT UNSIGNED    NOT NULL COMMENT '1-10',
    improvement_suggestion  TEXT                DEFAULT NULL,
    created_at              TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_feedback_session (session_id),

    CONSTRAINT chk_fb_technical    CHECK (technical_rating BETWEEN 1 AND 10),
    CONSTRAINT chk_fb_behavioral   CHECK (behavioral_rating BETWEEN 1 AND 10),

    CONSTRAINT fk_feedback_session FOREIGN KEY (session_id) REFERENCES session (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. SKILL (catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS skill (
    id      INT             AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(80)     NOT NULL,

    UNIQUE KEY uq_skill_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. SKILL_PROGRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS skill_progress (
    id          INT                 AUTO_INCREMENT PRIMARY KEY,
    student_id  INT                 NOT NULL,
    skill_id    INT                 NOT NULL,
    level       TINYINT UNSIGNED    NOT NULL DEFAULT 0 COMMENT '0-100%',
    recorded_at TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_sp_student (student_id),
    INDEX idx_sp_skill   (skill_id),
    INDEX idx_sp_date    (recorded_at),

    CONSTRAINT chk_sp_level CHECK (level <= 100),

    CONSTRAINT fk_sp_student FOREIGN KEY (student_id) REFERENCES student (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sp_skill   FOREIGN KEY (skill_id)   REFERENCES skill (id)   ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. ACTIVITY
-- ============================================================
CREATE TABLE IF NOT EXISTS activity (
    id          INT             AUTO_INCREMENT PRIMARY KEY,
    student_id  INT             NOT NULL,
    title       VARCHAR(200)    NOT NULL,
    details_url VARCHAR(512)    DEFAULT NULL,
    type        ENUM('feedback','achievement','integration','challenge','other') NOT NULL DEFAULT 'other',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_act_student (student_id),
    INDEX idx_act_date    (created_at),

    CONSTRAINT fk_act_student FOREIGN KEY (student_id) REFERENCES student (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 17. ADDRESS
-- ============================================================
CREATE TABLE IF NOT EXISTS address (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    user_id         INT             NOT NULL,
    postal_code     CHAR(8)         NOT NULL,
    street          VARCHAR(150)    NOT NULL,
    number          VARCHAR(10)     NOT NULL,
    complement      VARCHAR(80)     DEFAULT NULL,
    neighborhood    VARCHAR(100)    NOT NULL,
    city            VARCHAR(100)    NOT NULL,
    state           CHAR(2)         NOT NULL,
    country         VARCHAR(60)     NOT NULL DEFAULT 'Brasil',
    is_primary      TINYINT(1)      NOT NULL DEFAULT 0,

    INDEX idx_address_user (user_id),

    CONSTRAINT fk_address_user FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- NEW TABLES (v6)
-- ============================================================

-- 18. CONVERSATION
CREATE TABLE IF NOT EXISTS conversation (
    id              VARCHAR(36)     NOT NULL PRIMARY KEY,
    student_id      INT             NOT NULL,
    mentor_id       INT             NOT NULL,
    last_message_at TIMESTAMP       NULL DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_conv_pair (student_id, mentor_id),
    INDEX idx_conv_student (student_id),
    INDEX idx_conv_mentor  (mentor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. MESSAGE
CREATE TABLE IF NOT EXISTS message (
    id              VARCHAR(36)     NOT NULL PRIMARY KEY,
    conversation_id VARCHAR(36)     NOT NULL,
    sender_id       INT             NOT NULL,
    content         TEXT            NOT NULL,
    read_at         TIMESTAMP       NULL DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_msg_conv (conversation_id, created_at),

    CONSTRAINT fk_msg_conv FOREIGN KEY (conversation_id) REFERENCES conversation (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. NOTIFICATION
CREATE TABLE IF NOT EXISTS notification (
    id          VARCHAR(36)     NOT NULL PRIMARY KEY,
    user_id     INT             NOT NULL,
    type        VARCHAR(50)     NOT NULL,
    title       VARCHAR(200)    NOT NULL,
    body        TEXT            NOT NULL,
    data        JSON            DEFAULT NULL,
    read_at     TIMESTAMP       NULL DEFAULT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_notif_user (user_id, read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. ACTIVITY_LOG
CREATE TABLE IF NOT EXISTS activity_log (
    id          VARCHAR(36)     NOT NULL PRIMARY KEY,
    user_id     INT             NOT NULL,
    action      VARCHAR(100)    NOT NULL,
    entity_type VARCHAR(50)     DEFAULT NULL,
    entity_id   VARCHAR(36)     DEFAULT NULL,
    metadata    JSON            DEFAULT NULL,
    ip_address  VARCHAR(45)     DEFAULT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_actlog_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. AUDIT_LOG
CREATE TABLE IF NOT EXISTS audit_log (
    id          VARCHAR(36)     NOT NULL PRIMARY KEY,
    actor_id    INT             DEFAULT NULL,
    action      VARCHAR(100)    NOT NULL,
    target      VARCHAR(200)    NOT NULL,
    `before`    JSON            DEFAULT NULL,
    `after`     JSON            DEFAULT NULL,
    ip_address  VARCHAR(45)     DEFAULT NULL,
    user_agent  VARCHAR(500)    DEFAULT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_audit_actor   (actor_id),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. NOTIFICATION_PREFERENCE
CREATE TABLE IF NOT EXISTS notification_preference (
    id      VARCHAR(36)     NOT NULL PRIMARY KEY,
    user_id INT             NOT NULL,
    email   TINYINT(1)      NOT NULL DEFAULT 1,
    push    TINYINT(1)      NOT NULL DEFAULT 1,
    in_app  TINYINT(1)      NOT NULL DEFAULT 1,

    UNIQUE KEY uq_notpref_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. PAYOUT
CREATE TABLE IF NOT EXISTS payout (
    id              VARCHAR(36)     NOT NULL PRIMARY KEY,
    mentor_id       INT             NOT NULL,
    amount          DECIMAL(10,2)   NOT NULL,
    period_start    TIMESTAMP       NOT NULL,
    period_end      TIMESTAMP       NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'pending',
    provider_ref_id VARCHAR(100)    DEFAULT NULL,
    paid_at         TIMESTAMP       NULL DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_payout_mentor (mentor_id),
    INDEX idx_payout_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- BETTER AUTH TABLES — Added when Better Auth migration is active.
-- These conflict with the domain `user` table (INT id vs VARCHAR id).
-- Better Auth will be configured to use the existing `user` table
-- with custom field mapping at that time.
-- ============================================================
