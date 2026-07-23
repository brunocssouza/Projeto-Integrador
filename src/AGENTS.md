<!-- BEGIN:global -->

# Mock Mentor - Project Context

This is a Next.js 16 (App Router) + React 19 + MySQL mentoring platform.

## Key Conventions

- Routes: `/api/v1/*` — all API routes follow thin route + model pattern
- Models in `src/models/` handle all DB queries via Prisma ORM
- UUIDs (CHAR(36)) for all entity primary keys (Usuario, Aluno, Mentor, Sessao, etc.)
- Catalog tables (Idioma, Tecnologia, Habilidade) use INT auto-increment
- Auth via Better Auth (migrating from custom JWT/jose); lib/auth.ts is the Better Auth instance
- Validation: zod schemas in `src/lib/schemas/` shared between client forms and server routes
- Environment: `src/lib/env.ts` — all env vars validated via zod; never use process.env directly
- Error responses: `{ error: "mensagem", code: "ERROR_CODE", details?: {...} }` with appropriate HTTP status
- Success responses: `Response.json({ ...data })`
- AppError from `src/lib/errors.ts` for structured error handling
- Result type from `src/lib/result.ts` for ok()/fail() pattern
- Structured JSON logging via `src/lib/logger.ts` (never console.log raw in production paths)
- Redis client: `src/infra/redis.ts` via ioredis singleton
- DB connection: `src/infra/database.ts` — mysql2/promise pool (legacy, being replaced by Prisma)
- Prisma client: `src/lib/prisma.ts` — singleton PrismaClient (preferred for new code)
- Path alias: `@/*` maps to `src/*`
- Design system: Tailwind v4 tokens in globals.css, component library in `src/components/ui/`

## Skills

Skills are stored in `~/.agents/skills/` and installed via `npx skills add`.
Currently installed: tdd, find-skills.
<!-- END:global -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:setup -->

# Team workflow rules

All agents participate in one workflow.

Shared handoff file:

- Read `WORKFLOW_STATE.md` before starting work
- Update `WORKFLOW_STATE.md` before finishing work
- Never overwrite another section unnecessarily
- Preserve decisions, assumptions, blockers, and next steps

Workflow order:

1. Planner clarifies the request with the user
2. Planner writes clarified scope and acceptance criteria
3. Debater critiques the plan
4. Implementor makes the change
5. Reviewer reviews the result
6. Tester runs relevant tests
7. security-reviewer performs security code review
8. Linter checks formatting/linting
9. Commit-message writes the final commit message

Writing rules:

- Keep entries short and structured
- Prefer bullets over long paragraphs
- Record file paths when discussing code changes
- Record exact test commands and results
- Record unresolved questions under "Open Questions"

# Shared workflow rules

All agents must use WORKFLOW_STATE.md as the shared handoff file.

Before starting:

- Read WORKFLOW_STATE.md

After finishing:

- Update only the sections relevant to your role
- Preserve existing content unless it is outdated or clearly incorrect
- Add a short handoff note for the next agent

When working on code, dependencies, libraries, frameworks, or APIs:

- Record important findings in WORKFLOW_STATE.md

Do not use chat history as the only source of truth.
WORKFLOW_STATE.md is the canonical workflow record.
<!-- END:setup -->
