# IP blocklist service

NestJS REST API with PostgreSQL persistence and Redis/Keyv caching. The cache stores a JSON list, not a Redis Set.
The midnight import reads `BLOCKED_IPS_URL`, excludes comments and scores 1-2, and reconciles the database with that feed; manual entries absent from the feed can be removed.

1. Copy `.env.example` to `.env`. Keep `CACHE_PASSWORD` consistent with `redis.conf`.
2. Run `docker compose -f docker-compose.local.yml up --build` (API, PostgreSQL and Redis).
3. Open `http://localhost:3000/docs`. Routes are `GET`, `POST` and `DELETE /api/v1/block-list/:ip`.

For Node development, run `npm ci` and `npm run start:dev`; use `localhost` for database/cache hosts when dependencies run in Docker.
Checks: `npm test -- --runInBand`, `npm run test:cov` and `npm run build`. Measure coverage rather than assuming a fixed percentage.

The production image configuration is `docker-compose.prod.yml`. Replace sample passwords before use. Authentication, rate limiting, Redis HA and monitoring are not implemented by this sample; Redis persistence/backup must be configured for the desired durability.
