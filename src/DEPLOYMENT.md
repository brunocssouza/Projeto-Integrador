# Deployment & Scaling — Mock Mentor

This app is designed to scale horizontally with **no downtime**. Auth is a
stateless JWT cookie, so **no sticky sessions** are required — any instance can
serve any request.

## Architecture

```
Internet → [Nginx / Load Balancer]  ──┐
                          ↓ (least_conn, no affinity)
        [Next.js #1] [Next.js #2] ... [#N]
                          ↓                ↓
                 [MySQL (pool)]   [Redis (shared)]
```

- **App**: `next start` Node instances (PM2 cluster or Docker replicas).
- **Nginx**: reverse proxy + LB + static asset offload + TLS termination.
- **MySQL**: shared, accessed via a connection pool per instance.
- **Redis**: shared rate-limit + future cache/sessions (multi-instance safe).
- **Health check**: `GET /api/v1/status` (returns 200 when the DB is reachable).

---

## Option A — Self-hosted (PM2 + Nginx)

1. **Build** the app:
   ```bash
   npm run build
   ```
2. **Start multiple instances** (one per CPU core) with PM2:
   ```bash
   npm run start:cluster      # pm2 start ecosystem.config.cjs
   npm run start:lb           # zero-downtime reload on deploys
   npm run stop:cluster
   ```
   PM2 cluster shares port `3000` (the OS load-balances across the workers).
3. **Configure Nginx** using `nginx.conf`:
   - Copy to `/etc/nginx/sites-available/mock-mentor`, symlink to `sites-enabled`.
   - List each instance port in the `upstream` block if running separate ports.
   - `nginx -t && systemctl reload nginx`.
4. **Point uploads at a shared volume** — set `UPLOAD_DIR` to a path mounted on
   all instances (e.g. NFS) so avatars are readable from any replica.

## Option B — Docker Compose (full stack)

Spin up app replicas + Nginx + Redis + MySQL in one command:

```bash
docker compose up -d --build
docker compose up -d --scale app=3    # 3 app replicas
```

- `nginx.docker.conf` uses Docker DNS (`app:3000`) which round-robins across
  replicas automatically.
- `uploads_data` volume is shared across replicas.
- Schema is auto-loaded into MySQL on first boot via `database/schema.sql`.

After first boot, seed the DB:

```bash
docker compose exec app dotenv -e .env.local -- npx tsx scripts/seed.ts
```

> Use a **managed MySQL** and **managed Redis** in real production; the compose
> versions are for convenience/dev parity.

---

## Multi-instance correctness

These were made instance-safe:

| Concern            | Fix                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **Rate limiting**  | `lib/rate-limit.ts` now uses Redis (`INCR`+`EXPIRE`) when `REDIS_URL` is set; falls back to in-memory for single-instance/dev. |
| **Redis client**   | `infra/redis.ts` — lazy ioredis singleton; degrades gracefully to `null` if unavailable.                                       |
| **DB connections** | `infra/database.ts` — `DB_CONNECTION_LIMIT` (default 10) per instance. Total ≈ N × limit; keep below MySQL `max_connections`.  |
| **Uploads**        | `UPLOAD_DIR` is env-configurable; point at a shared volume or object storage in prod (local disk is fine for single-instance). |
| **Health**         | `GET /api/v1/status` reports DB version + open connections; used by Nginx/Docker health checks.                                |
| **JWT**            | Same `JWT_SECRET` across all instances (tokens verify everywhere).                                                             |

## Key files

- `ecosystem.config.cjs` — PM2 cluster config
- `nginx.conf` — self-hosted LB config
- `nginx.docker.conf` — Docker LB config
- `docker-compose.yml` — full stack
- `Dockerfile` — multi-stage app image
- `infra/redis.ts`, `lib/rate-limit.ts`, `infra/database.ts` — multi-instance code

## Scaling checklist

- [ ] `npm run build` succeeds
- [ ] `REDIS_URL` set (so rate limits are global)
- [ ] `JWT_SECRET` identical on every instance
- [ ] `UPLOAD_DIR` on a shared volume
- [ ] `DB_CONNECTION_LIMIT × instances ≤ MySQL max_connections`
- [ ] Health check `GET /api/v1/status` returns 200
- [ ] At least 2 instances running (no single point of failure)
