# Mock Mentor

![Titulo](https://github.com/user-attachments/assets/ffd9a30c-1fc7-4a2b-a7b0-31badfd6231d)

Plataforma de mentorias que conecta alunos a mentores de tecnologia. O foco é preparar talentos para o mercado real atraves de sessoes individuais, acompanhamento de progresso e feedback estruturado. Diferente de plataformas convencionais de cursos, aqui o aluno escolhe um mentor especifico, agenda sessoes ao vivo e recebe avaliacoes direcionadas a sua area de interesse.

---

## Membros

Bruno Cesar Silva de Souza
Larissa Silva de Souza Neitzke

---

## Funcionalidades

- Autenticacao com JWT (login, cadastro, logout) e controle de sessoes via cookie HttpOnly
- Dois modos de cadastro: aluno, mentor ou ambos
- Busca e listagem de mentores com filtros por tecnologia, rating e preco
- Perfil completo do mentor com foto, video de apresentacao, tecnologias, idiomas e avaliacoes
- Agendamento de sessoes com verificacao de disponibilidade em tempo real
- Fluxo de aprovacao/rejeicao de sessoes pelo mentor
- Sala de reuniao virtual com link, registro de entrada e status (agendada, em andamento, concluida, cancelada)
- Sistema de avaliacao de mentores com nota, titulo e comentario
- Dashboard do aluno com proxima sessao, estatisticas, sessoes recentes e mentores em destaque
- Relatorio de progresso com habilidades, horas de pratica e atividade recente
- Extrato de transacoes com historico de pagamentos por sessao
- Painel administrativo com listagem e exclusao de usuarios
- Upload de avatar com validacao de tipo e magic bytes

---

## Perfis de Acesso

**Aluno**
- Busca e visualiza mentores
- Agenda e gerencia sessoes
- Acessa dashboard e relatorios de progresso
- Visualiza historico de transacoes
- Avalia mentores apos sessoes concluidas

**Mentor**
- Configura perfil com dados profissionais, precos e disponibilidade
- Define horarios por dia da semana com multiplas plataformas de video
- Sincroniza tecnologias de atuacao
- Aprova ou recusa solicitacoes de sessao
- Acompanha estatisticas e lista de alunos
- Inicia, conclui e cancela sessoes

**Administrador**
- Visualiza todos os usuarios cadastrados com seus papeis
- Exclui contas de usuarios

---

## Tecnologias e Bibliotecas

**Frontend**
- Next.js 16.2.10 (App Router)
- React 19.2.4
- Tailwind CSS 4
- GSAP 3.15 (animacoes na landing page)
- Recharts 3.9 (graficos)

**Backend**
- API Routes do Next.js
- MySQL 8+ (conexao direta com mysql2)
- JWT (jose) para autenticacao
- bcryptjs para hash de senhas

**Infraestrutura e Ferramentas**
- Docker Compose para MySQL
- dotenv-cli para ambiente de desenvolvimento
- TypeScript 5
- Prettier para formatacao
- Git

**Testes**
- Jest 30
- Testing Library (React)
- Testes unitarios e de integracao

---

## Estrutura do Projeto

```
src/
  app/api/v1/       -- Rotas da API (auth, mentors, sessions, dashboard, admin, reports, transactions, status)
  app/(pages)/      -- Paginas da aplicacao (landing, login, register, dashboard, mentors, sessions, admin, etc.)
  components/       -- Componentes React reutilizaveis
  contexts/         -- Contextos (AuthContext)
  infra/            -- Conexao com banco, autenticacao e migrations
  lib/              -- Utilitarios (validacao de CPF, email, telefone)
  models/           -- Camada de acesso a dados (User, Mentor, Session, Admin, Dashboard, Report, Review, Transaction, SessionList)
  scripts/          -- Scripts de banco (db-reset + seed)
  tests/            -- Testes unitarios (unit/) e de integracao (integration/)
```

---

## Banco de Dados

Modelagem relacional com 17 tabelas:

- Catalogos: Idioma, Tecnologia, Habilidade (IDs numericos)
- Entidades: Usuario, Aluno, Mentor, Sessao, Pagamento, Avaliacao_Mentor, Disponibilidade, Feedback, Progresso_Habilidade, Atividade, Endereco (UUIDs)
- Relacionais: Usuario_Idioma, Mentor_Idioma, Mentor_Tecnologia

Diagrama ER disponivel no repositorio.

---

## Requisitos

- Node.js 22+ (lts/krypton)
- MySQL 8.0+ (via Docker ou instalacao local)
- NPM

---

## Instalacao e Uso

```bash
# 1. Clonar e instalar dependencias
npm install

# 2. Subir o MySQL
npm run services:up

# 3. Configurar variaveis de ambiente
cp .env.example .env.local

# 4. Resetar banco (drop + create + seed)
npm run db:reset

# 5. Iniciar servidor
npm run dev

# 6. Rodar testes (com servidor rodando para testes de integracao)
npm run test
```

---

## Credenciais de Teste

| Perfil        | Email                  | Senha  |
|---------------|------------------------|--------|
| Aluno         | teste@teste.com        | 123456 |
| Mentor        | mentor@mentor.com      | 123456 |
| Admin         | admin@mockmentor.com   | 123456 |
| Ana (Front)   | ana@mentor.com         | 123456 |
| Carlos (Back) | carlos@mentor.com      | 123456 |
| Mariana (PM)  | mariana@mentor.com     | 123456 |
| Rafael (Cloud)| rafael@mentor.com      | 123456 |

---

## Scripts Disponiveis

| Comando              | Descricao                                   |
|----------------------|---------------------------------------------|
| npm run dev          | Inicia servidor Next.js                     |
| npm run build        | Build de producao                           |
| npm run test         | Testes unitarios + integracao (--runInBand) |
| npm run test:watch   | Testes em modo watch                        |
| npm run db:reset     | Recria banco e aplica seed                  |
| npm run services:up  | Sobe MySQL via Docker                       |
| npm run services:down| Para o MySQL                                |
| npm run lint:check   | Verifica formatacao com Prettier            |
| npm run lint:fix     | Corrige formatacao                          |

---

## Modelagem (Miro)

Link para o board com planejamento e idealizacao:
https://miro.com/app/board/uXjVILQbGt8=/?share_link_id=723781613977
