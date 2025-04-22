/* Modelo_Logico: */

CREATE TABLE Entrevista (
	entrevista_id NUMERIC(13) PRIMARY KEY,
    area VARCHAR(255) NOT NULL,
    idioma VARCHAR(255) NOT NULL,
    duracao TIMESTAMP,
    fk_Aluno_fk_Usuario_usuario_id NUMERIC(13),
    fk_Aluno_fk_Usuario_cpf VARCHAR(255),
    fk_Tutor_fk_Usuario_usuario_id NUMERIC(13),
    fk_Tutor_fk_Usuario_cpf VARCHAR(255),
    fk_Feedback_feedback_id NUMERIC(13)
);

CREATE TABLE Feedback (
	feedback_id NUMERIC(13) PRIMARY KEY,
    avaliacao_fluencia VARCHAR(255) NOT NULL,
    sugestao_melhoria VARCHAR(255) NOT NULL,
    avaliacao_tecnica VARCHAR(255) NOT NULL
);

CREATE TABLE Aluno (
    formacao_academica VARCHAR(255) NOT NULL,
    idioma_nivelamento VARCHAR(255) NOT NULL,
    fk_Usuario_usuario_id NUMERIC(13),
    fk_Usuario_cpf VARCHAR(255),
    PRIMARY KEY (fk_Usuario_usuario_id, fk_Usuario_cpf)
);

CREATE TABLE Agendamento (
	agendamento_id NUMERIC(13) PRIMARY KEY,
    area VARCHAR(255) NOT NULL,
    idioma VARCHAR(255) NOT NULL,
    valor MONEY NOT NULL,
    duracao TIME NOT NULL,
    "data" DATE NOT NULL,
    hora TIME NOT NULL,
    fk_Aluno_fk_Usuario_usuario_id NUMERIC(13),
    fk_Aluno_fk_Usuario_cpf VARCHAR(255),
    fk_Tutor_fk_Usuario_usuario_id NUMERIC(13),
    fk_Tutor_fk_Usuario_cpf VARCHAR(255),
    fk_Pagamento_pagamento_id NUMERIC(13)
);

CREATE TABLE Pagamento (
    pagamento_id NUMERIC(13) PRIMARY KEY,
    forma_de_pagamento VARCHAR(255) NOT NULL,
    valor MONEY NOT NULL
);

CREATE TABLE Tutor (
    cargo VARCHAR(255) NOT NULL,
    comentario VARCHAR(255) NOT NULL,
    idioma VARCHAR(255) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    experiencia_profissional VARCHAR(255) NOT NULL,
    fk_Usuario_usuario_id NUMERIC(13),
    fk_Usuario_cpf VARCHAR(255),
    PRIMARY KEY (fk_Usuario_usuario_id, fk_Usuario_cpf)
);

CREATE TABLE Usuario (
	usuario_id NUMERIC(13),
    cpf VARCHAR(255),
    disponibilidade VARCHAR(255) NOT NULL,
    usuario_nome VARCHAR(255) NOT NULL,
    telefone2 NUMERIC(13) NOT NULL,
    telefone1 NUMERIC(13),
    nacionalidade VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    PRIMARY KEY (usuario_id, cpf)
);

CREATE TABLE TecnologiaConhecida_Tutor (
    fk_Tutor_fk_Usuario_usuario_id NUMERIC(13),
    fk_Tutor_fk_Usuario_cpf VARCHAR(255),
    fk_Tecnologia_Conhecida_tecnologia_conhecida_id NUMERIC(13)
);

CREATE TABLE Endereco_Usuario (
    fk_Usuario_usuario_id NUMERIC(13),
    fk_Usuario_cpf VARCHAR(255),
    fk_Endereco_endereco_id NUMERIC(13)
);

CREATE TABLE Tecnologia_Conhecida (
    tecnologia_conhecida_id NUMERIC(13) PRIMARY KEY,
    nome_tecnologia_conhecida VARCHAR(255) NOT NULL
);

CREATE TABLE Endereco (
    endereco_id NUMERIC(13) PRIMARY KEY,
    bairro VARCHAR(255) NOT NULL,
    cep NUMERIC(8) NOT NULL,
    complemento VARCHAR(255),
    numero NUMERIC(13) NOT NULL,
    rua VARCHAR(255) NOT NULL,
    estado VARCHAR(255) NOT NULL,
    pais VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL
);
 
ALTER TABLE Entrevista ADD CONSTRAINT FK_Entrevista_2
    FOREIGN KEY (fk_Aluno_fk_Usuario_usuario_id, fk_Aluno_fk_Usuario_cpf)
    REFERENCES Aluno (fk_Usuario_usuario_id, fk_Usuario_cpf);
 
ALTER TABLE Entrevista ADD CONSTRAINT FK_Entrevista_3
    FOREIGN KEY (fk_Tutor_fk_Usuario_usuario_id, fk_Tutor_fk_Usuario_cpf)
    REFERENCES Tutor (fk_Usuario_usuario_id, fk_Usuario_cpf);
 
ALTER TABLE Entrevista ADD CONSTRAINT FK_Entrevista_4
    FOREIGN KEY (fk_Feedback_feedback_id)
    REFERENCES Feedback (feedback_id);
 
ALTER TABLE Aluno ADD CONSTRAINT FK_Aluno_2
    FOREIGN KEY (fk_Usuario_usuario_id, fk_Usuario_cpf)
    REFERENCES Usuario (usuario_id, cpf)
    ON DELETE CASCADE;
 
ALTER TABLE Agendamento ADD CONSTRAINT FK_Agendamento_2
    FOREIGN KEY (fk_Aluno_fk_Usuario_usuario_id, fk_Aluno_fk_Usuario_cpf)
    REFERENCES Aluno (fk_Usuario_usuario_id, fk_Usuario_cpf);
 
ALTER TABLE Agendamento ADD CONSTRAINT FK_Agendamento_3
    FOREIGN KEY (fk_Tutor_fk_Usuario_usuario_id, fk_Tutor_fk_Usuario_cpf)
    REFERENCES Tutor (fk_Usuario_usuario_id, fk_Usuario_cpf);
 
ALTER TABLE Agendamento ADD CONSTRAINT FK_Agendamento_4
    FOREIGN KEY (fk_Pagamento_pagamento_id)
    REFERENCES Pagamento (pagamento_id);
 
ALTER TABLE Tutor ADD CONSTRAINT FK_Tutor_2
    FOREIGN KEY (fk_Usuario_usuario_id, fk_Usuario_cpf)
    REFERENCES Usuario (usuario_id, cpf)
    ON DELETE CASCADE;
 
ALTER TABLE TecnologiaConhecida_Tutor ADD CONSTRAINT FK_TecnologiaConhecida_Tutor_1
    FOREIGN KEY (fk_Tutor_fk_Usuario_usuario_id, fk_Tutor_fk_Usuario_cpf)
    REFERENCES Tutor (fk_Usuario_usuario_id, fk_Usuario_cpf);
 
ALTER TABLE TecnologiaConhecida_Tutor ADD CONSTRAINT FK_TecnologiaConhecida_Tutor_2
    FOREIGN KEY (fk_Tecnologia_Conhecida_tecnologia_conhecida_id)
    REFERENCES Tecnologia_Conhecida (tecnologia_conhecida_id);
 
ALTER TABLE Endereco_Usuario ADD CONSTRAINT FK_Endereco_Usuario_1
    FOREIGN KEY (fk_Usuario_usuario_id, fk_Usuario_cpf)
    REFERENCES Usuario (usuario_id, cpf);
 
ALTER TABLE Endereco_Usuario ADD CONSTRAINT FK_Endereco_Usuario_2
    FOREIGN KEY (fk_Endereco_endereco_id)
    REFERENCES Endereco (endereco_id);





-- Trigger: Agendamento > Entrevista
CREATE OR REPLACE FUNCTION inserir_entrevista_apos_agendamento()
RETURNS TRIGGER AS $$
DECLARE
    novo_id_entrevista NUMERIC(13);
BEGIN
    SELECT COALESCE(MAX(entrevista_id), 0) + 1 INTO novo_id_entrevista FROM Entrevista;

    INSERT INTO Entrevista (
        entrevista_id,
        area,
        idioma,
        duracao,
        fk_Aluno_fk_Usuario_usuario_id,
        fk_Aluno_fk_Usuario_cpf,
        fk_Tutor_fk_Usuario_usuario_id,
        fk_Tutor_fk_Usuario_cpf
    ) VALUES (
        novo_id_entrevista,
        NEW.area,
        NEW.idioma,
        NULL,
        NEW.fk_Aluno_fk_Usuario_usuario_id,
        NEW.fk_Aluno_fk_Usuario_cpf,
        NEW.fk_Tutor_fk_Usuario_usuario_id,
        NEW.fk_Tutor_fk_Usuario_cpf
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_inserir_entrevista ON Agendamento;
CREATE TRIGGER trigger_inserir_entrevista
AFTER INSERT ON Agendamento
FOR EACH ROW
EXECUTE FUNCTION inserir_entrevista_apos_agendamento();
