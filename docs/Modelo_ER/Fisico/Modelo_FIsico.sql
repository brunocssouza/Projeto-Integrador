
CREATE TABLE Usuario (
    usuario_id INT AUTO_INCREMENT,
    cpf VARCHAR(255),
    disponibilidade VARCHAR(255) NOT NULL,
    usuario_nome VARCHAR(255) NOT NULL,
    telefone1 BIGINT NOT NULL,
    telefone2 BIGINT NOT NULL,
    nacionalidade VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    PRIMARY KEY (usuario_id, cpf)
);

CREATE TABLE Aluno (
    formacao_academica VARCHAR(255) NOT NULL,
    idioma_nivelamento VARCHAR(255) NOT NULL,
    fk_Usuario_usuario_id INT,
    fk_Usuario_cpf VARCHAR(255),
    PRIMARY KEY (fk_Usuario_usuario_id, fk_Usuario_cpf),
    FOREIGN KEY (fk_Usuario_usuario_id, fk_Usuario_cpf)
        REFERENCES Usuario (usuario_id, cpf)
        ON DELETE CASCADE
);

CREATE TABLE Tutor (
    cargo VARCHAR(255) NOT NULL,
    comentario VARCHAR(255) NOT NULL,
    idioma VARCHAR(255) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    experiencia_profissional VARCHAR(255) NOT NULL,
    fk_Usuario_usuario_id INT,
    fk_Usuario_cpf VARCHAR(255),
    PRIMARY KEY (fk_Usuario_usuario_id, fk_Usuario_cpf),
    FOREIGN KEY (fk_Usuario_usuario_id, fk_Usuario_cpf)
        REFERENCES Usuario (usuario_id, cpf)
        ON DELETE CASCADE
);

CREATE TABLE Feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    avaliacao_fluencia VARCHAR(255) NOT NULL,
    sugestao_melhoria VARCHAR(255) NOT NULL,
    avaliacao_tecnica VARCHAR(255) NOT NULL
);

CREATE TABLE Entrevista (
    entrevista_id INT AUTO_INCREMENT PRIMARY KEY,
    area VARCHAR(255) NOT NULL,
    idioma VARCHAR(255) NOT NULL,
    duracao TIMESTAMP,
    fk_Aluno_fk_Usuario_usuario_id INT,
    fk_Aluno_fk_Usuario_cpf VARCHAR(255),
    fk_Tutor_fk_Usuario_usuario_id INT,
    fk_Tutor_fk_Usuario_cpf VARCHAR(255),
    fk_Feedback_feedback_id INT,
    FOREIGN KEY (fk_Aluno_fk_Usuario_usuario_id, fk_Aluno_fk_Usuario_cpf)
        REFERENCES Aluno (fk_Usuario_usuario_id, fk_Usuario_cpf),
    FOREIGN KEY (fk_Tutor_fk_Usuario_usuario_id, fk_Tutor_fk_Usuario_cpf)
        REFERENCES Tutor (fk_Usuario_usuario_id, fk_Usuario_cpf),
    FOREIGN KEY (fk_Feedback_feedback_id)
        REFERENCES Feedback (feedback_id)
);

CREATE TABLE Pagamento (
    pagamento_id INT AUTO_INCREMENT PRIMARY KEY,
    forma_de_pagamento VARCHAR(255) NOT NULL,
    valor DECIMAL(13,2) NOT NULL
);

CREATE TABLE Agendamento (
    agendamento_id INT AUTO_INCREMENT PRIMARY KEY,
    area VARCHAR(255) NOT NULL,
    idioma VARCHAR(255) NOT NULL,
    valor DECIMAL(13,2) NOT NULL,
    duracao TIME NOT NULL,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    fk_Aluno_fk_Usuario_usuario_id INT,
    fk_Aluno_fk_Usuario_cpf VARCHAR(255),
    fk_Tutor_fk_Usuario_usuario_id INT,
    fk_Tutor_fk_Usuario_cpf VARCHAR(255),
    fk_Pagamento_pagamento_id INT,
    FOREIGN KEY (fk_Aluno_fk_Usuario_usuario_id, fk_Aluno_fk_Usuario_cpf)
        REFERENCES Aluno (fk_Usuario_usuario_id, fk_Usuario_cpf),
    FOREIGN KEY (fk_Tutor_fk_Usuario_usuario_id, fk_Tutor_fk_Usuario_cpf)
        REFERENCES Tutor (fk_Usuario_usuario_id, fk_Usuario_cpf),
    FOREIGN KEY (fk_Pagamento_pagamento_id)
        REFERENCES Pagamento (pagamento_id)
);

CREATE TABLE Tecnologia_Conhecida (
    tecnologia_conhecida_id INT AUTO_INCREMENT PRIMARY KEY,
    nome_tecnologia_conhecida VARCHAR(255) NOT NULL
);

CREATE TABLE TecnologiaConhecida_Tutor (
    fk_Tutor_fk_Usuario_usuario_id INT,
    fk_Tutor_fk_Usuario_cpf VARCHAR(255),
    fk_Tecnologia_Conhecida_tecnologia_conhecida_id INT,
    FOREIGN KEY (fk_Tutor_fk_Usuario_usuario_id, fk_Tutor_fk_Usuario_cpf)
        REFERENCES Tutor (fk_Usuario_usuario_id, fk_Usuario_cpf),
    FOREIGN KEY (fk_Tecnologia_Conhecida_tecnologia_conhecida_id)
        REFERENCES Tecnologia_Conhecida (tecnologia_conhecida_id)
);

CREATE TABLE Endereco (
    endereco_id INT AUTO_INCREMENT PRIMARY KEY,
    bairro VARCHAR(255) NOT NULL,
    cep INT NOT NULL,
    complemento VARCHAR(255),
    numero INT NOT NULL,
    rua VARCHAR(255) NOT NULL,
    estado VARCHAR(255) NOT NULL,
    pais VARCHAR(255) NOT NULL,
    cidade VARCHAR(255) NOT NULL
);

CREATE TABLE Endereco_Usuario (
    fk_Usuario_usuario_id INT,
    fk_Usuario_cpf VARCHAR(255),
    fk_Endereco_endereco_id INT,
    FOREIGN KEY (fk_Usuario_usuario_id, fk_Usuario_cpf)
        REFERENCES Usuario (usuario_id, cpf),
    FOREIGN KEY (fk_Endereco_endereco_id)
        REFERENCES Endereco (endereco_id)
);
