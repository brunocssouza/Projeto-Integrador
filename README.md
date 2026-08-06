# Mock Mentor

![Titulo](https://github.com/user-attachments/assets/ffd9a30c-1fc7-4a2b-a7b0-31badfd6231d)

Plataforma de mentorias que conecta alunos a mentores de tecnologia. O foco é preparar talentos para o mercado real através de sessões individuais, acompanhamento de progresso e feedback estruturado. Diferente de plataformas convencionais de cursos, aqui o aluno escolhe um mentor específico, agenda sessões ao vivo e recebe avaliações direcionadas à sua área de interesse.

---

## Membros

Bruno Cesar Silva de Souza
Larissa Silva de Souza Neitzke

---

## Funcionalidades

- Autenticação com JWT (login, cadastro, logout) via cookie HttpOnly
- Cadastro como **Aluno** ou **Mentor** (alunos podem tornar-se mentor depois, nas configurações)
- Mentores passam por **aprovação do administrador** (até 3 dias úteis) antes de acessar a plataforma
- Busca e listagem de mentores com filtros por tecnologia, rating e preço
- Perfil completo do mentor com foto, vídeo de apresentação, tecnologias, idiomas e avaliações
- Agendamento de sessões com verificação de disponibilidade em tempo real e **bloqueio visual de horários já reservados**
- **Etapa de pagamento** (PIX) no fluxo de agendamento
- Fluxo de aprovação/rejeição de sessões pelo mentor
- Botão "Entrar na Call" que **libera 30 minutos antes** do início da sessão (aluno e mentor)
- Sala de reunião virtual com link, registro de entrada e status (agendada, em andamento, concluída, cancelada)
- Sistema de avaliação de mentores com nota, título e comentário
- Dashboard do aluno com próxima sessão, estatísticas, sessões recentes e mentores em destaque
- Relatório de progresso com habilidades, horas de prática e atividade recente
- Extrato de transações com histórico de pagamentos por sessão
- **Painel administrativo** completo: aprovar/recusar mentores (com perfil detalhado), listar/excluir usuários, ver sessões e pagamentos
- Upload de avatar com validação de tipo e magic bytes
- **Pronto para escalabilidade horizontal**: balanceador de carga (Nginx), Redis para rate-limit compartilhado, pool de conexões MySQL configurável

---

## Perfis de Acesso

**Aluno**

- Busca e visualiza mentores
- Agenda e gerencia sessões (com pagamento via PIX)
- Acessa dashboard e relatórios de progresso
- Visualiza histórico de transações
- Avalia mentores após sessões concluídas
- Pode candidatar-se a mentor nas configurações

**Mentor**

- Cadastro sujeito a aprovação do administrador
- Configura perfil com dados profissionais, preços e disponibilidade
- Define horários por dia da semana com múltiplas plataformas de vídeo
- Aprova ou recusa solicitações de sessão
- Acompanha estatísticas e lista de alunos
- Inicia, conclui e cancela sessões

**Administrador**

- Aprova ou recusa cadastros de mentores (com motivo de recusa)
- Visualiza todos os usuários cadastrados com seus papéis
- Exclui contas de usuários
- Visualiza todas as sessões e pagamentos
- Acompanha estatísticas gerais (usuários, mentores, receita)

---

## Tecnologias e Bibliotecas

**Frontend**

- Next.js 16.2.10 (App Router)
- React 19.2.4
- Tailwind CSS 4
- GSAP 3.15 (animações na landing page)
- Recharts 3.9 (gráficos)

**Backend**

- API Routes do Next.js (`/api/v1/*`)
- MySQL 8+ (mysql2 com connection pool)
- JWT (jose) para autenticação
- bcryptjs para hash de senhas
- Zod para validação de schemas
- Mercado Pago (PIX) para pagamentos

**Infraestrutura e Ferramentas**

- PM2 (cluster mode) e/ou Docker Compose para múltiplas instâncias
- Nginx como load balancer
- Redis (ioredis) para rate-limit compartilhado entre instâncias
- TypeScript 5
- Prettier para formatação
- Git

**Testes**

- Jest 30
- Testing Library (React)
- Testes unitários e de integração

---

## Estrutura do Projeto

```
src/
  app/api/v1/          -- Rotas da API (auth, mentors, sessions, dashboard, admin, payments, etc.)
  app/(pages)/         -- Páginas (landing, login, register, dashboard, admin, mentor, agendamentos, etc.)
  components/          -- Componentes React reutilizáveis (Sidebar, MentorOptIn, UI)
  contexts/            -- Contextos (AuthContext)
  infra/               -- Banco (database.ts), Redis (redis.ts), auth, email
  lib/                 -- Utilitários (validação, schemas, errors, rate-limit, session-join, payments)
  models/              -- Camada de acesso a dados (User, Mentor, Session, Admin, Dashboard, etc.)
  scripts/             -- Scripts de banco (db-schema, seed)
  tests/               -- Testes unitários (unit/) e de integração (integration/)
  database/schema.sql  -- Schema completo do banco
  ecosystem.config.cjs -- Config do PM2 (cluster)
  nginx.conf           -- Config do load balancer (self-hosted)
  docker-compose.yml   -- Stack completa (app + nginx + redis + mysql)
  Dockerfile           -- Imagem da aplicação
```

---

## Pré-requisitos

Antes de começar, você precisa ter instalado na sua máquina:

1. **Git** — para clonar o repositório
   - Windows: <https://git-scm.com/download/win>
   - Verifique: `git --version`

2. **Node.js 22+** (LTS "krypton", conforme `.nvmrc`)
   - Baixe em <https://nodejs.org/> (versão LTS)
   - Ou use [nvm](https://github.com/nvm-sh/nvm): `nvm install lts/krypton && nvm use`
   - Verifique: `node --version` (deve ser ≥ 22.x)

3. **NPM** — vem junto com o Node.js
   - Verifique: `npm --version`

4. **MySQL 8.0+** — banco de dados
   - **Opção A (recomendada):** via Docker — `docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8`
   - **Opção B:** instalação local — <https://dev.mysql.com/downloads/>
   - Verifique: `mysql --version`

5. **Redis** (opcional, apenas para múltiplas instâncias / produção)
   - Via Docker: `docker run -d --name redis -p 6379:6379 redis:7-alpine`
   - Sem Redis, o rate-limit usa memória (funciona em instância única)

---

## Instalação e Uso — Passo a Passo

### 1. Clonar o repositório

```bash
git clone https://github.com/<seu-usuario>/mock-mentor.git
cd mock-mentor/src
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo e ajuste se necessário (senha do MySQL, etc.):

```bash
cp .env.example .env.local
```

O `.env.local` já vem com valores padrão para desenvolvimento local
(`root:root@localhost:3306/mock_mentor`). Se o seu MySQL tiver outra senha,
edite `DATABASE_PASSWORD` e `DATABASE_URL`.

### 4. Subir o MySQL (se ainda não estiver rodando)

```bash
# Via Docker:
docker run -d --name mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8

# Ou inicie o serviço local:
# Windows:  net start MySQL80
# Linux:    sudo systemctl start mysql
```

### 5. Criar o banco e popular com dados de teste

```bash
npm run db:reset
```

Isso recria o banco `mock_mentor`, aplica todas as tabelas (`database/schema.sql`)
e roda a seed com usuários e dados de demonstração.

### 6. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: <http://localhost:3000>

### 7. Rodar os testes

Os testes de **integração** fazem chamadas HTTP reais, então **mantenha o
servidor rodando** (`npm run dev`) em outro terminal:

```bash
npm run test
```

---

## Credenciais de Teste

Todas as contas abaixo são criadas pela seed (`npm run db:reset`) e usam a
**senha `123456`**.

### Aluno

| Email                         | Senha    | Observação                           |
| ----------------------------- | -------- | ------------------------------------ |
| `aluno@aluno.com`             | `123456` | Apenas aluno                         |
| `alunomentor@alunomentor.com` | `123456` | Aluno **e** mentor (perfil completo) |
| `admin@admin.com`             | `123456` | Admin (também é aluno)               |

### Mentor

| Email                         | Senha    | Observação                       |
| ----------------------------- | -------- | -------------------------------- |
| `mentor@mentor.com`           | `123456` | Apenas mentor (já aprovado)      |
| `alunomentor@alunomentor.com` | `123456` | Aluno e mentor (perfil completo) |
| `admin@admin.com`             | `123456` | Admin (também é mentor)          |

> **Nota:** para testar o **fluxo de aprovação de mentor**, cadastre um novo
> mentor pelo `/register` — ele ficará pendente e não conseguirá logar até ser
> aprovado pelo admin no painel `/admin/mentores`.

### Administrador

| Email             | Senha    |
| ----------------- | -------- |
| `admin@admin.com` | `123456` |
| `admin@admin.com` | `123456` |
| `admin@admin.com` | `123456` |

> Há apenas 1 conta admin na seed. Use `admin@admin.com` / `123456`.
> O login de admin redireciona para o painel em `/admin`.

---

## Rotas GET para Testar

Com o servidor rodando (`npm run dev`) e um cookie de autenticação válido
(faça login via `/login` ou pela API abaixo), você pode testar estas rotas:

### Autenticação

```bash
# Login (retorna o cookie de sessão)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aluno@aluno.com","password":"123456"}' \
  -c cookies.txt

# Usuário atual (usa o cookie)
curl http://localhost:3000/api/v1/auth/me -b cookies.txt

# Logout
curl -X POST http://localhost:3000/api/v1/auth/logout -b cookies.txt
```

### Status e Dashboard

```bash
# Health check (não precisa de auth — usado pelo load balancer)
curl http://localhost:3000/api/v1/status

# Dashboard do aluno
curl http://localhost:3000/api/v1/dashboard -b cookies.txt
```

### Mentores

```bash
# Listar mentores (para o /explore)
curl http://localhost:3000/api/v1/mentors -b cookies.txt

# Perfil de um mentor (substitua :id, ex: 1)
curl http://localhost:3000/api/v1/mentors/1 -b cookies.txt

# Disponibilidade do mentor
curl http://localhost:3000/api/v1/mentors/1/disponibilidade -b cookies.txt

# Horários já reservados do mentor (para o fluxo de agendamento)
curl http://localhost:3000/api/v1/mentors/1/booked -b cookies.txt
```

### Sessões

```bash
# Listar sessões do usuário (aluno vê as suas; mentor vê as que recebe)
curl http://localhost:3000/api/v1/sessions -b cookies.txt

# Detalhes de uma sessão (substitua :id)
curl http://localhost:3000/api/v1/sessions/1 -b cookies.txt
```

### Admin (precisa logar como `admin@admin.com`)

```bash
# Re-login como admin
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"123456"}' \
  -c cookies.txt

# Estatísticas gerais
curl http://localhost:3000/api/v1/admin/stats -b cookies.txt

# Mentores pendentes de aprovação (com perfil completo)
curl http://localhost:3000/api/v1/admin/mentors/pending -b cookies.txt

# Todos os mentores
curl http://localhost:3000/api/v1/admin/mentors -b cookies.txt

# Todos os usuários
curl http://localhost:3000/api/v1/admin/users -b cookies.txt

# Todas as sessões
curl http://localhost:3000/api/v1/admin/sessions -b cookies.txt

# Todos os pagamentos
curl http://localhost:3000/api/v1/admin/payments -b cookies.txt
```

### Páginas no navegador

| Rota                   | Descrição                                  |
| ---------------------- | ------------------------------------------ |
| `/`                    | Landing page                               |
| `/login`               | Tela de login                              |
| `/register`            | Cadastro (Aluno ou Mentor)                 |
| `/dashboard`           | Dashboard do aluno                         |
| `/explore`             | Explorar mentores                          |
| `/agendamentos`        | Meus agendamentos (aluno)                  |
| `/mentor/[id]`         | Perfil público de um mentor + agendamento  |
| `/mentor/alunos`       | Meus alunos (mentor)                       |
| `/mentor/agendamentos` | Agendamentos como mentor (aprovar/recusar) |
| `/configuracoes`       | Configurações (+ candidatar-se a mentor)   |
| `/admin`               | Painel administrativo                      |
| `/admin/mentores`      | Aprovação de mentores                      |
| `/admin/usuarios`      | Gerenciar usuários                         |
| `/admin/sessoes`       | Todas as sessões                           |
| `/admin/pagamentos`    | Todos os pagamentos                        |

---

## Scripts Disponíveis

| Comando                 | Descrição                                     |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Inicia o servidor Next.js (desenvolvimento)   |
| `npm run build`         | Build de produção                             |
| `npm run start`         | Inicia o servidor de produção (após build)    |
| `npm run start:cluster` | Inícia múltiplas instâncias via PM2 (cluster) |
| `npm run start:lb`      | Reload zero-downtime do cluster PM2           |
| `npm run stop:cluster`  | Para o cluster PM2                            |
| `npm run test`          | Testes unitários + integração (`--runInBand`) |
| `npm run test:watch`    | Testes em modo watch                          |
| `npm run db:schema`     | Aplica o schema SQL no banco                  |
| `npm run db:reset`      | Recria o banco (drop + schema + seed)         |
| `npm run db:seed`       | Popula o banco com dados de teste             |
| `npm run lint`          | Roda o ESLint                                 |
| `npm run lint:check`    | Verifica formatação com Prettier              |
| `npm run lint:fix`      | Corrige formatação com Prettier               |

---

## Banco de Dados

Modelagem relacional (ver `src/database/schema.sql`) com tabelas para:

- **Catálogos:** `language`, `technology`
- **Entidades:** `user`, `student`, `mentor`, `session`, `payment`, `mentor_review`, `availability`
- **Relacionais:** `user_language`, `mentor_language`, `mentor_technology`

O mentor possui `approval_status` (`pending` / `approved` / `rejected`) que
controla o acesso à plataforma.

---

## Escalabilidade (Produção)

A aplicação está pronta para rodar em múltiplas instâncias atrás de um load
balancer, sem downtime. Veja `src/DEPLOYMENT.md` para o guia completo.

**Resumo:**

- Auth stateless (JWT cookie) → **não precisa de sticky sessions**
- Rate-limit via **Redis** (compartilhado entre instâncias)
- Pool de MySQL configurável por instância (`DB_CONNECTION_LIMIT`)
- Uploads em volume compartilhado
- Health check em `/api/v1/status`

```bash
# Self-hosted (PM2 + Nginx):
npm run build
npm run start:cluster

# Docker (stack completa):
docker compose up -d --build --scale app=3
```

---

## Modelagem (Miro)

Link para o board com planejamento e idealização:
<https://miro.com/app/board/uXjVILQbGt8=/?share_link_id=723781613977>
