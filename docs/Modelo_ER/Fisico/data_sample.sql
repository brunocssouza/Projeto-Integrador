-- Usuario: usuario_id, cpf, disponibilidade, usuario_nome, telefone2, telefone1, nacionalidade, data_nascimento, senha, email
INSERT INTO Usuario VALUES
(1, '12345678900', 'Manhã', 'Larissa Neitzke', 999999999, 988888888, 'Brasileira', '22-04-2001', 'senha123', 'larissa@email.com'),
(2, '23456789011', 'Tarde', 'Bruno César', 977777777, 966666666, 'Brasileiro', '15-03-1995', 'senha456', 'bruno@email.com'),
(3, '34567890122', 'Noite', 'Ana Lima', 955555555, 944444444, 'Brasileira', '01-01-1990', 'senha789', 'ana@email.com');

-- Endereco: endereco_id, bairro, cep, complemento, numero, rua, estado, pais, cidade
INSERT INTO Endereco VALUES
(1, 'Centro', 12345678, 'Ap 101', 100, 'Av Central', 'SP', 'Brasil', 'São Paulo'),
(2, 'Jardins', 23456789, 'Casa', 200, 'Rua das Flores', 'RJ', 'Brasil', 'Rio de Janeiro'),
(3, 'Bela Vista', 34567890, NULL, 300, 'Rua 7 de Setembro', 'MG', 'Brasil', 'Belo Horizonte');

-- Endereco_Usuario: fk_Usuario_usuario_id, fk_Usuario_cpf, fk_Endereco_endereco_id
INSERT INTO Endereco_Usuario VALUES
(1, '12345678900', 1),
(2, '23456789011', 2),
(3, '34567890122', 3);

-- Aluno: formacao_academica, idioma_nivelamento, fk_Usuario_usuario_id, fk_Usuario_cpf
INSERT INTO Aluno VALUES
('Graduação em Letras', 'Avançado', 1, '12345678900'),
('Ensino Médio', 'Intermediário', 2, '23456789011'),
('Graduação em TI', 'Básico', 3, '34567890122');

-- Tutor: cargo, comentario, idioma, descricao, experiencia_profissional, fk_Usuario_usuario_id, fk_Usuario_cpf
INSERT INTO Tutor VALUES
('Professor', 'Ótimo comunicador', 'Inglês', 'Ensina bem', '5 anos', 2, '23456789011'),
('Instrutor', 'Paciência com alunos', 'Espanhol', 'Foco em conversação', '3 anos', 3, '34567890122'),
('Mentor', 'Didática excelente', 'Francês', 'Trabalho personalizado', '4 anos', 1, '12345678900');

-- Tecnologia_Conhecida: tecnologia_conhecida_id, nome_tecnologia_conhecida
INSERT INTO Tecnologia_Conhecida VALUES
(1, 'Python'),
(2, 'JavaScript'),
(3, 'SQL');

-- TecnologiaConhecida_Tutor: fk_Tutor_fk_Usuario_usuario_id, fk_Tutor_fk_Usuario_cpf, fk_Tecnologia_Conhecida_tecnologia_conhecida_id
INSERT INTO TecnologiaConhecida_Tutor VALUES
(2, '23456789011', 1),
(3, '34567890122', 2),
(1, '12345678900', 3);

-- Pagamento: pagamento_id, forma_de_pagamento, valor
INSERT INTO Pagamento VALUES
(1, 'Cartão', 100.00),
(2, 'Pix', 120.50),
(3, 'Boleto', 80.75);

-- Agendamento: agendamento_id, area, idioma, valor, duracao, data, hora, fk_Aluno_fk_Usuario_usuario_id, fk_Aluno_fk_Usuario_cpf, fk_Tutor_fk_Usuario_usuario_id, fk_Tutor_fk_Usuario_cpf, fk_Pagamento_pagamento_id
INSERT INTO Agendamento VALUES
(1, 'Conversação', 'Inglês', 100.00, '01:00', '25-04-2025', '10:00', 1, '12345678900', 2, '23456789011', 1),
(2, 'Gramática', 'Espanhol', 120.50, '01:30', '26-04-2025', '14:00', 2, '23456789011', 3, '34567890122', 2),
(3, 'Vocabulário', 'Francês', 80.75, '00:45', '27-04-2025', '16:30', 3, '34567890122', 1, '12345678900', 3);

-- Feedback: feedback_id, avaliacao_fluencia, sugestao_melhoria, avaliacao_tecnica
INSERT INTO Feedback VALUES
(1, 'Boa', 'Melhorar entonação', 'Muito boa'),
(2, 'Regular', 'Estudar mais vocabulário', 'Razoável'),
(3, 'Excelente', 'Nenhuma', 'Ótima');

