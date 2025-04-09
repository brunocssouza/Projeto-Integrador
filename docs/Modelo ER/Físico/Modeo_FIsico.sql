/* Lógico_1: */

CREATE TABLE Tutor (
    descricao VARCHAR(255),
    cargo VARCHAR(255),
    idioma VARCHAR(255),
    comentario VARCHAR(255),
    experiencia_profissional VARCHAR(255),
    fk_Usuario_usuario_id INT(13),
    fk_Usuario_cpf VARCHAR(255),
    PRIMARY KEY (fk_Usuario_usuario_id, fk_Usuario_cpf)
);

CREATE TABLE Entrevista (
    area VARCHAR(255),
    idioma VARCHAR(255),
    feedback VARCHAR(255),
    entrevista_id INT(13) PRIMARY KEY,
    duracao TIMESTAMP,
    fk_Tutor_fk_Usuario_usuario_id INT(13),
    fk_Tutor_fk_Usuario_cpf VARCHAR(255),
    fk_Aluno_fk_Usuario_usuario_id INT(13),
    fk_Aluno_fk_Usuario_cpf VARCHAR(255)
);

CREATE TABLE Pagamento (
    valor MONEY,
    forma_de_pagamento VARCHAR(255),
    pagamento_id INT(13) PRIMARY KEY
);

CREATE TABLE Agendamento (
    data DATE,
    hora TIME,
    duracao TIME,
    area VARCHAR(255),
    idioma VARCHAR(255),
    valor MONEY,
    agendamento_id INT(13) PRIMARY KEY,
    fk_Tutor_fk_Usuario_usuario_id INT(13),
    fk_Tutor_fk_Usuario_cpf VARCHAR(255),
    fk_Aluno_fk_Usuario_usuario_id INT(13),
    fk_Aluno_fk_Usuario_cpf VARCHAR(255),
    fk_Pagamento_pagamento_id INT(13)
);

CREATE TABLE Usuario (
    usuario_id INT(13),
    usuario_nome VARCHAR(255),
    email VARCHAR(255),
    senha VARCHAR(255),
    data_nascimento DATE,
    telefone1 INT(13),
    telefone2 INT(13),
    cpf VARCHAR(255),
    nacionalidade VARCHAR(255),
    disponibilidade VARCHAR(255),
    PRIMARY KEY (usuario_id, cpf)
);

CREATE TABLE Aluno (
    idioma_nivelamento VARCHAR(255),
    formacao_academica VARCHAR(255),
    fk_Usuario_usuario_id INT(13),
    fk_Usuario_cpf VARCHAR(255),
    PRIMARY KEY (fk_Usuario_usuario_id, fk_Usuario_cpf)
);

CREATE TABLE Endereco (
    rua VARCHAR(255),
    numero INT(13),
    bairro VARCHAR(255),
    complemento VARCHAR(255),
    cidade VARCHAR(255),
    estado VARCHAR(255),
    pais VARCHAR(255),
    cep INT(8),
    endereco_id INT(13) PRIMARY KEY
);

CREATE TABLE Endereco_Usuario (
    fk_Endereco_endereco_id INT(13),
    fk_Usuario_usuario_id INT(13),
    fk_Usuario_cpf VARCHAR(255)
);
 
ALTER TABLE Tutor ADD CONSTRAINT FK_Tutor_2
    FOREIGN KEY (fk_Usuario_usuario_id, fk_Usuario_cpf)
    REFERENCES Usuario (usuario_id, cpf)
    ON DELETE CASCADE;
 
ALTER TABLE Entrevista ADD CONSTRAINT FK_Entrevista_2
    FOREIGN KEY (fk_Tutor_fk_Usuario_usuario_id, fk_Tutor_fk_Usuario_cpf)
    REFERENCES Tutor (fk_Usuario_usuario_id, fk_Usuario_cpf);
 
ALTER TABLE Entrevista ADD CONSTRAINT FK_Entrevista_3
    FOREIGN KEY (fk_Aluno_fk_Usuario_usuario_id, fk_Aluno_fk_Usuario_cpf)
    REFERENCES Aluno (fk_Usuario_usuario_id, fk_Usuario_cpf);
 
ALTER TABLE Agendamento ADD CONSTRAINT FK_Agendamento_2
    FOREIGN KEY (fk_Tutor_fk_Usuario_usuario_id, fk_Tutor_fk_Usuario_cpf)
    REFERENCES Tutor (fk_Usuario_usuario_id, fk_Usuario_cpf);
 
ALTER TABLE Agendamento ADD CONSTRAINT FK_Agendamento_3
    FOREIGN KEY (fk_Aluno_fk_Usuario_usuario_id, fk_Aluno_fk_Usuario_cpf)
    REFERENCES Aluno (fk_Usuario_usuario_id, fk_Usuario_cpf);
 
ALTER TABLE Agendamento ADD CONSTRAINT FK_Agendamento_4
    FOREIGN KEY (fk_Pagamento_pagamento_id)
    REFERENCES Pagamento (pagamento_id);
 
ALTER TABLE Aluno ADD CONSTRAINT FK_Aluno_2
    FOREIGN KEY (fk_Usuario_usuario_id, fk_Usuario_cpf)
    REFERENCES Usuario (usuario_id, cpf)
    ON DELETE CASCADE;
 
ALTER TABLE Endereco_Usuario ADD CONSTRAINT FK_Endereco_Usuario_1
    FOREIGN KEY (fk_Endereco_endereco_id)
    REFERENCES Endereco (endereco_id)
    ON DELETE RESTRICT;
 
ALTER TABLE Endereco_Usuario ADD CONSTRAINT FK_Endereco_Usuario_2
    FOREIGN KEY (fk_Usuario_usuario_id, fk_Usuario_cpf)
    REFERENCES Usuario (usuario_id, cpf)
    ON DELETE RESTRICT;