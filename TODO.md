# EventsCuratorAI — Task Breakdown

## How to Use This File

**Workflow per task:**
1. Write tests FIRST (red phase) — the test must fail before you touch implementation
2. Implement until tests pass (green phase)
3. `git diff` — review the diff manually before committing
4. Commit with a descriptive message referencing this task
5. Update `CLAUDE.md` or `AGENTS.md` if you learned a new convention (compound loop)
6. Check the box and move to the next task

**Evidence gates:** Each phase ends with a ✅ gate. Do NOT start the next phase until:
- All checkboxes in the phase are checked
- `npm test` passes with zero failures
- A human has reviewed the diff or PR

---

## Phase 0: Foundation ⬜

> Goal: Repo is fully runnable, tested, and CI-green from day one.

- [ ] Initialize `package.json` with workspaces (root, `apps/api`, `apps/web`)
- [ ] Configure TypeScript (`tsconfig.json`) with strict mode + path aliases
- [ ] Set up ESLint (TypeScript rules) + Prettier with pre-commit hook via Husky
- [ ] Configure Vitest for unit tests + coverage thresholds (≥ 80%)
- [ ] Write first smoke test: `src/lib/logger.test.ts` — logger returns structured JSON
- [ ] Set up Drizzle ORM + `db/migrations/` — create initial migration scaffold
- [ ] Add `.env.example` with all required variable names (no secrets)
- [ ] GitHub Actions CI: lint → typecheck → unit tests → integration tests
- [ ] Docker Compose for local dev: postgres, redis, api, web
- [ ] Review all AI config files (`CLAUDE.md`, `AGENTS.md`, `copilot-instructions.md`)

**✅ Gate 0:** `npm test` passes, CI is green, Docker Compose `up` reaches healthy state.

---

## Phase 1: Data Models & Database ⬜

> Goal: All core entities exist in DB with tested CRUD operations.

- [ ] Write failing tests for `Event` model (create, read, upsert by external ID)
- [ ] Drizzle schema: `events` table (id, title, description, start_at, end_at, location, lat, lng, category, source, external_id, raw_payload, created_at)
- [ ] Drizzle schema: `users` table (id, email, auth0_id, location, interests[], created_at)
- [ ] Drizzle schema: `user_event_interactions` (user_id, event_id, action: view/save/ignore/attend, timestamp)
- [ ] Drizzle schema: `recommendations` (id, user_id, event_id, score, reasoning, generated_at)
- [ ] Drizzle schema: `ingestion_runs` (id, source, status, events_fetched, events_new, started_at, completed_at)
- [ ] Write + run migration; add seed data for 3 test users + 20 mock events
- [ ] Integration tests for all CRUD operations against test DB
- [ ] Add DB index on `events.start_at`, `events.location`, `events.(lat, lng)`

**✅ Gate 1:** All DB tests pass, migrations run clean on a fresh DB, seed script works.

---

## Phase 2: Event Ingestion Workers ⬜

> Goal: Events are pulled from ≥ 2 real sources on a schedule, deduplicated, and stored.

- [ ] Write failing unit tests for `EventNormalizer` — maps raw Eventbrite/Meetup payload → internal `Event` type
- [ ] Implement `EventNormalizer` with source-specific adapters (`eventbrite.ts`, `meetup.ts`)
- [ ] Write failing unit test for deduplication logic (upsert by `source + external_id`)
- [ ] Implement Eventbrite ingestion service (OAuth2 flow + paginated event search)
- [ ] Implement Meetup ingestion service (GraphQL API)
- [ ] Add Facebook Events placeholder (stub + TODO comment — requires app review)
- [ ] BullMQ: `IngestionQueue` with cron schedule (every 6 hours per source)
- [ ] BullMQ: `IngestionWorker` — processes jobs, calls adapters, stores to DB, records `ingestion_runs`
- [ ] Integration test: mock external APIs (nock), run worker, assert events saved + deduplicated
- [ ] Ingestion health endpoint: `GET /api/ingestion/status` returns last run per source

**✅ Gate 2:** Worker runs end-to-end in test, ≥ 2 sources ingest real events in staging.

---

## Phase 3: AI Curation Engine ⬜

> Goal: GPT-4o generates ranked, personalized event recommendations per user.

- [ ] Write failing unit tests for `CurationPromptBuilder` — given user profile + event list → valid prompt string
- [ ] Implement `CurationPromptBuilder`: encodes user interests, location, interaction history into system + user prompt
- [ ] Write failing unit tests for `CurationResponseParser` — parses GPT JSON output → `Recommendation[]`
- [ ] Implement `CurationResponseParser` with Zod validation on GPT response schema
- [ ] BullMQ: `CurationQueue` — triggered after each ingestion run or user profile update
- [ ] BullMQ: `CurationWorker` — fetches candidate events within user's radius, calls GPT-4o, stores recommendations
- [ ] Rate limiting + token budget: cap per-user curation at 1 run / 4 hours, log token usage
- [ ] Fallback: if GPT call fails, return geo + interest filtered events without AI scoring
- [ ] Unit tests for fallback path (simulate OpenAI timeout/error)
- [ ] `GET /api/recommendations` — returns ranked recommendations for authenticated user

**✅ Gate 3:** Recommendations endpoint returns GPT-scored results; fallback verified; token cost logged.

---

## Phase 4: REST API ⬜

> Goal: Full CRUD API with auth, validation, and tested happy + error paths.

- [ ] `POST /api/auth/callback` — Auth0 callback, creates/updates user record
- [ ] `GET /api/users/me` — returns profile (interests, location, interaction stats)
- [ ] `PATCH /api/users/me` — update interests and location; triggers curation re-run
- [ ] `GET /api/events` — paginated event list with filters (category, date range, radius, source)
- [ ] `GET /api/events/:id` — event detail + similar events
- [ ] `POST /api/events/:id/interact` — record view/save/ignore/attend interaction
- [ ] `GET /api/recommendations` — personalized recommendations (cached 4h, busted on interaction)
- [ ] `GET /api/ingestion/status` — last run per source + health
- [ ] Middleware: JWT auth (Auth0), Zod request validation, rate limiting (100 req/min per user)
- [ ] Integration tests for all endpoints: happy path + 401 + 422 + 404 paths
- [ ] OpenAPI spec auto-generated from Zod schemas (`zod-to-openapi`)

**✅ Gate 4:** All route integration tests pass; Postman collection or OpenAPI spec exported.

---

## Phase 5: React Frontend ⬜

> Goal: Working UI for browsing events and viewing AI recommendations.

- [ ] Vite + React 18 + TailwindCSS + React Router v6 setup
- [ ] Auth0 React SDK integration — login/logout, protected routes
- [ ] `EventCard` component — title, date, location, source badge, save/ignore actions
- [ ] `EventList` page — paginated grid with filter sidebar (category, date, radius)
- [ ] `RecommendationsPage` — AI-curated feed with reasoning tooltip per event
- [ ] `ProfilePage` — edit interests (tag input), set location
- [ ] `IngestionStatusBadge` — shows last sync time per source
- [ ] React Query for all API calls — loading, error, stale-while-revalidate states
- [ ] Playwright e2e: login → view recommendations → save an event → verify interaction persisted
- [ ] Responsive layout: mobile (≤ 375px) + desktop (≥ 1280px) tested

**✅ Gate 5:** e2e test suite passes; app loads in < 2s on throttled 4G (Lighthouse ≥ 80).

---

## Phase 6: Polish & Harden ⬜

> Goal: Production-ready observability, security, and performance.

- [ ] Structured logging (Pino) with correlation IDs on every request
- [ ] Error boundary + Sentry integration (frontend + backend)
- [ ] PostgreSQL connection pooling (pg-pool) tuned for production load
- [ ] Redis caching layer for recommendation results (TTL = 4h)
- [ ] API response compression (gzip)
- [ ] Security headers (Helmet.js), CORS locked to frontend origin
- [ ] Input sanitization audit — all user-supplied strings passed through Zod
- [ ] Load test: k6 script simulating 100 concurrent users browsing events (target: p99 < 500ms)
- [ ] Database query analysis — EXPLAIN ANALYZE on top-5 slowest queries; add missing indexes
- [ ] Secrets rotation documentation in `docs/ops.md`

**✅ Gate 6:** k6 load test passes target; Sentry reports 0 unhandled errors in staging.

---

## Phase 7: Ship ⬜

> Goal: Deployed, monitored, documented.

- [ ] Dockerfile for API (multi-stage, non-root user)
- [ ] Dockerfile for web (Nginx static serve)
- [ ] Deploy pipeline in CI: build → push to GHCR → deploy to Render / Railway / Fly.io
- [ ] Automated DB migration step in deploy pipeline (`drizzle-kit migrate`)
- [ ] Health check endpoint `GET /healthz` (DB + Redis ping)
- [ ] README "Deploy" section with one-click deploy button
- [ ] Smoke test suite that runs against production URL post-deploy
- [ ] Monitor: uptime check + alert on p99 > 1s or error rate > 1%

**✅ Gate 7:** Production URL is live, smoke tests pass, monitoring alerts configured.

---

## Parking Lot 🅿️

> Ideas to revisit — don't implement until Phase 3+ is shipped:

- Google Events / Ticketmaster / RSS feed adapters
- Social graph integration (import from contacts or LinkedIn)
- Group recommendations (shared interests across friend group)
- Notification system (email digest / push for saved events)
- Mobile app (React Native)
- Fine-tuned embedding model for event similarity (replace GPT ranking with vector search)
- Public shareable event lists

---

## Lessons Learned 📝

> Update this section as the project evolves. These feed back into CLAUDE.md / AGENTS.md.

- _Add entries here as you discover gotchas, non-obvious patterns, or corrected assumptions_
