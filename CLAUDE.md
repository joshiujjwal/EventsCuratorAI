# CLAUDE.md — EventsCuratorAI

Agent context file. Keep under 200 lines. Update when you discover new conventions.

---

## Commands

```bash
# Install
npm install

# Dev (API + web + workers concurrently)
npm run dev

# Run workers only
npm run workers

# Database
npm run db:migrate          # run pending migrations
npm run db:migrate:gen      # generate new migration from schema changes
npm run db:seed             # seed dev data

# Tests
npm test                    # unit tests (Vitest, no I/O)
npm run test:int            # integration tests (needs Postgres + Redis)
npm run test:e2e            # Playwright e2e (needs full stack running)
npm run test:coverage       # coverage report (threshold: 80%)

# Quality
npm run lint                # ESLint
npm run lint:fix            # ESLint + auto-fix
npm run typecheck           # tsc --noEmit
npm run format              # Prettier

# Build
npm run build               # compile TypeScript
```

---

## Directory Map

```
src/api/routes/       → Express route files, one per resource (events, users, recommendations)
src/api/middleware/   → Auth JWT validation, Zod request validation, rate limiter
src/api/services/     → Business logic; no Express types here, fully testable
src/workers/          → BullMQ workers: IngestionWorker, CurationWorker
src/lib/              → Singletons: db client (Drizzle), openai client, redis client, logger (Pino)
src/types/            → Shared TypeScript interfaces; import from here, never re-declare
src/config/           → env.ts (Zod-parsed process.env), feature flags
db/migrations/        → Drizzle-generated SQL migration files (never hand-edit)
db/seeds/             → Dev seed scripts (idempotent)
tests/unit/           → Pure function tests — no DB, no HTTP, no OpenAI calls
tests/integration/    → API + DB tests using a test database (DATABASE_URL_TEST)
tests/e2e/            → Playwright tests against running stack
docs/spec.md          → Source of truth for features; update before implementing
docs/adr/             → Architecture Decision Records
```

---

## Key Conventions

### TypeScript
- `strict: true` always — no `any`, no `as unknown as X` without a comment explaining why
- All environment variables validated at startup via `src/config/env.ts` (Zod schema)
- Path aliases: `@api/*`, `@lib/*`, `@types/*`, `@workers/*` — configured in `tsconfig.json` + Vitest

### Database (Drizzle ORM)
- Schema defined in `src/lib/db/schema.ts` — this is the source of truth
- Never hand-edit migration files — always `npm run db:migrate:gen` after schema changes
- Transactions required for multi-table writes (use `db.transaction()`)
- All queries in `src/api/services/` — never inline SQL in route handlers

### AI / OpenAI
- OpenAI client is a singleton in `src/lib/openai.ts`
- Always use `gpt-4o` model ID (not `gpt-4o-2024-...` dated versions — let it float)
- GPT responses MUST be validated with Zod before use — never trust raw JSON
- Log token usage on every call: `{ model, prompt_tokens, completion_tokens, user_id }`
- Curation prompt template lives in `src/api/services/curation/promptBuilder.ts` — change prompt there, not inline

### Workers (BullMQ)
- Queue names are constants in `src/workers/queues.ts` — never magic strings
- Workers must be idempotent — safe to re-run a failed job
- All worker errors are caught, logged, and recorded in `ingestion_runs` / curation logs — never silently swallow

### API
- Zod schema for every request body and query param — in `src/api/routes/<resource>.ts`
- HTTP errors: use `createHttpError` from `http-errors` — never `res.status(400).json(...)`
- All routes return camelCase JSON; DB columns are snake_case (Drizzle maps automatically)

### Testing
- Unit tests in `tests/unit/` — mock all I/O at module boundary with `vi.mock()`
- Integration tests use a separate test DB (`DATABASE_URL_TEST`) — reset between test files with `beforeEach`
- Never share state between test files
- Test file naming: `<subject>.test.ts` co-located with source OR under `tests/`

---

## Workflow

1. **Read `TODO.md`** — find the next unchecked item in the current phase
2. **Run tests first**: `npm test` — confirm baseline is green before touching anything
3. **Write the failing test** (red) — commit as `test: <description> (red)`
4. **Implement** until `npm test` passes (green) — commit as `feat: <description>`
5. **Lint + typecheck**: `npm run lint && npm run typecheck` — fix before committing
6. **Update this file** if you learned a new convention
7. Check the box in `TODO.md` and append to `Lessons Learned` if relevant

---

## Non-Obvious Gotchas

- `OPENAI_API_KEY` must have GPT-4o access — GPT-3.5 will not match the Zod schema (different JSON structure)
- Eventbrite pagination uses a `continuation` cursor token, not page numbers
- Meetup uses GraphQL — see `src/api/services/ingestion/meetup.ts` for query shape
- `lat`/`lng` stored as `NUMERIC(9,6)` — do NOT compare with `=`, use `ST_DWithin` if PostGIS is added later, or Haversine formula in JS for now
- BullMQ requires `REDIS_URL` to use `redis://` scheme (not `rediss://`) unless TLS is explicitly configured
- Auth0 JWTs expire in 24h by default — refresh token rotation must be enabled in the Auth0 dashboard
