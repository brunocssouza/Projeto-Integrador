-- Usuários
INSERT INTO Usuario (cpf, disponibilidade, usuario_nome, telefone2, telefone1, nacionalidade, data_nascimento, senha, email)
VALUES 
('12345678901', 'Disponível', 'João Silva', '11988887777', '1133221100', 'Brasileira', '1990-05-10', 'senha123', 'joao@email.com'),
('11122233344', 'Disponível', 'Larissa Neitzke', '11995556666', '1144223344', 'Brasileira', '1995-03-12', 'larissa123', 'larissa@email.com'),
('55566677788', 'Disponível', 'Bruno César', '11997778888', '1199111222', 'Brasileira', '1992-08-25', 'bruno123', 'bruno@email.com');

-- Alunos
INSERT INTO Aluno (formacao_academica, idioma_nivelamento, fk_Usuario_usuario_id, fk_Usuario_cpf)
VALUES 
('Engenharia', 'Inglês Intermediário', 1, '12345678901'),
('Ciência da Computação', 'Inglês Avançado', 3, '55566677788');

-- Tutores
INSERT INTO Tutor (cargo, comentario, idioma, descricao, experiencia_profissional, fk_Usuario_usuario_id, fk_Usuario_cpf)
VALUES 
('Mentora de Direito Digital', 'Especialista em LGPD e compliance', 'Português', 'Experiência em Direito Digital', '8 anos na área jurídica', 2, '11122233344'),
('Mentor de Tecnologia', 'Apaixonado por ensinar programação', 'Inglês', 'Experiência em backend e IA', '6 anos como dev sênior', 3, '55566677788');

-- Pagamento
INSERT INTO Pagamento (forma_de_pagamento, valor)
VALUES ('Pix', 200.00);

-- Agendamento
INSERT INTO Agendamento (area, idioma, valor, duracao, data, hora, fk_Aluno_fk_Usuario_usuario_id, fk_Aluno_fk_Usuario_cpf, fk_Tutor_fk_Usuario_usuario_id, fk_Tutor_fk_Usuario_cpf, fk_Pagamento_pagamento_id)
VALUES 
('Tecnologia', 'Inglês', 200.00, '01:30:00', '2025-08-05', '14:00:00', 3, '55566677788', 3, '55566677788', 2);

-- Feedback
INSERT INTO Feedback (avaliacao_fluencia, sugestao_melhoria, avaliacao_tecnica)
VALUES ('Excelente dicção', 'Estudar mais sobre terminologias técnicas', 'Muito bom domínio do conteúdo');

-- Entrevista
INSERT INTO Entrevista (area, idioma, duracao, fk_Aluno_fk_Usuario_usuario_id, fk_Aluno_fk_Usuario_cpf, fk_Tutor_fk_Usuario_usuario_id, fk_Tutor_fk_Usuario_cpf, fk_Feedback_feedback_id)
VALUES ('Direito Digital', 'Português', CURRENT_TIMESTAMP, 3, '55566677788', 2, '11122233344', 2);

-- Endereços
INSERT INTO Endereco (bairro, cep, complemento, numero, rua, estado, pais, cidade)
VALUES 
('Centro', 12345678, 'Apto 12', 100, 'Rua das Flores', 'SP', 'Brasil', 'São Paulo'),
('Jardim América', 87654321, NULL, 501, 'Av. Brasil', 'RS', 'Brasil', 'Porto Alegre'),
('Bela Vista', 11000100, 'Casa', 10, 'Rua Horizonte Azul', 'SC', 'Brasil', 'Blumenau');

-- Endereço dos usuários
INSERT INTO Endereco_Usuario (fk_Usuario_usuario_id, fk_Usuario_cpf, fk_Endereco_endereco_id)
VALUES 
(1, '12345678901', 1),
(2, '11122233344', 2),
(3, '55566677788', 3);

-- Tecnologias
INSERT INTO Tecnologia_Conhecida (nome_tecnologia_conhecida)
VALUES ('Java'), ('SQL'), ('Python'), ('LGPD'), ('Direito Digital');

-- Relacionamentos Tutor - Tecnologia
INSERT INTO TecnologiaConhecida_Tutor (fk_Tutor_fk_Usuario_usuario_id, fk_Tutor_fk_Usuario_cpf, fk_Tecnologia_Conhecida_tecnologia_conhecida_id)
VALUES 
(2, '11122233344', 4), -- Larissa -> LGPD
(2, '11122233344', 5), -- Larissa -> Direito Digital
(3, '55566677788', 1), -- Bruno -> Java
(3, '55566677788', 2), -- Bruno -> SQL
(3, '55566677788', 3); -- Bruno -> Python
