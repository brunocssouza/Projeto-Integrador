# Workflow State

## Request

Implement the full v2.0 architecture plan from /memories/session/plan.md.

## Clarified Scope

Phase-by-phase implementation starting with P1_FOUNDATIONS:

- **P1**: Dependencies, env validation, Redis/logger/errors primitives, AGENTS.md update
- **P2**: Prisma schema migration from raw SQL
- **P4**: Zod validation layer (parallel with P3)
- **P3**: Better Auth migration
- **P5**: Security hardening
- **P6**: Payments (Mercado Pago)
- **P7**: Messaging + Notifications + Email
- **P8**: Design System
- **P9**: Frontend Architecture
- **P10**: New Frontend Features
- **P11**: Testing Strategy
- **P12**: CI/CD + Docker Deploy

## Architecture Decisions (locked)

- Payment: Mercado Pago (Pix + Cartão)
- Auth: Better Auth replacing custom JWT
- Validation: zod shared schemas
- ORM: Prisma replacing raw mysql2
- Design: Tailwind v4 tokens + shadcn-style primitives
- Testing: vitest + Playwright with TDD
- Deploy: Self-hosted Docker VPS with Redis

## Current Phase

**P6_PAYMENTS** — Next up

## Completed Phases

- **P1_FOUNDATIONS** ✅ — Dependencies, env validation, logger, errors, result
- **P2_SCHEMA_PRISMA** ✅ — Canonical schema.sql (24+4 Better Auth tables), Prisma synced, models migrated to INT IDs
- **P4_ZOD** ✅ — All zod schema modules created (auth, mentor, session, payment, review, message, common) + validate.ts route helpers + wired into key routes
- **P3_BETTER_AUTH** ✅ — Better Auth instance, catch-all route, session helper, auth-guard, auth-client
- **P5_SECURITY** ✅ — Rate limiter (in-memory), audit logging, safe uploads

## Open Questions

- Mentor chat: open or post-booking only? (recommend: post-booking)
- Refund window: 24h before session?
- Platform fee %?
- Keep /api/v1/auth/* as proxies or migrate to /api/auth/* endpoints?

## Constraints

- Next.js 16 App Router, React 19
- MySQL 8.0, Redis
- Single VPS deployment
- Existing DB has data — migrations must be additive and safe

## Files Changed (P1)

- `src/lib/env.ts` ✅
- `src/lib/logger.ts` ✅
- `src/lib/errors.ts` ✅
- `src/lib/result.ts` ✅
- `src/infra/redis.ts` ✅
- `eslint.config.mjs` ✅
- `AGENTS.md` ✅
- `WORKFLOW_STATE.md` ✅ (this file)

## Next Steps

- P2.1: Create prisma/schema.prisma from existing database/schema.sql
- P4.1: Create zod schema modules (can parallel with P2)
