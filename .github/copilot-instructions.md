# GitHub Copilot Instructions — EventsCuratorAI

## Project Context

EventsCuratorAI is a TypeScript monorepo that:
1. Ingests events from Eventbrite, Meetup, and (stub) Facebook Events via BullMQ workers
2. Uses OpenAI GPT-4o to generate personalized ranked recommendations per user
3. Exposes a REST API (Express + Node.js) and a React frontend (Vite + TailwindCSS)
4. Persists to PostgreSQL via Drizzle ORM; caches recommendations in Redis

---

## Stack

| Concern       | Library/Tool                      |
|---------------|-----------------------------------|
| Language      | TypeScript 5.x (strict)           |
| Backend       | Node.js 20 + Express 5            |
| ORM           | Drizzle ORM                       |
| DB            | PostgreSQL 16                     |
| Cache/Queue   | Redis 7 + BullMQ                  |
| AI            | OpenAI SDK v4 (GPT-4o)            |
| Validation    | Zod                               |
| Testing       | Vitest + Supertest + Playwright   |
| Frontend      | React 18 + Vite + TailwindCSS     |
| Data fetching | React Query (TanStack Query v5)   |
| Auth          | Auth0                             |

---

## Coding Conventions

- **No `any`** — if type is unknown, use `unknown` and narrow it
- **Named exports only** — no default exports
- **Path aliases** — use `@lib/`, `@api/`, `@types/`, `@workers/` (not relative `../../../`)
- **Environment variables** — always read from `src/config/env.ts`, never from `process.env` directly
- **Zod everywhere** — validate all external data (API inputs, GPT responses, env vars, external API responses)
- **Async/await** — never raw Promises or `.then()` chains
- **Error throwing** — use `createHttpError` in route handlers; use typed custom errors in services

---

## Testing Conventions

- Write the failing test BEFORE writing implementation
- Test file naming: `<module>.test.ts` (unit) or `<module>.integration.test.ts`
- Unit tests must not touch DB, HTTP, or OpenAI — mock everything with `vi.mock()`
- Integration tests use `DATABASE_URL_TEST` pointing at a test DB
- Coverage threshold: 80% lines on all files in `src/`

---

## AI / GPT-4o Conventions

- Always use model `gpt-4o` (not `gpt-4`, not dated versions)
- All GPT responses parsed with Zod — if parsing fails, throw `CurationParseError` (triggers fallback)
- Prompt templates are in `src/api/services/curation/promptBuilder.ts` — never inline prompts in workers
- Log every GPT call: `{ user_id, model, prompt_tokens, completion_tokens, latency_ms }`

---

## Boundaries

- Do NOT refactor code that isn't related to the current task
- Do NOT remove or skip tests to make coverage pass — fix the code
- Do NOT inline SQL — all queries go through Drizzle ORM
- Do NOT store secrets in source code — use `.env` (gitignored)
- Do NOT merge a PR with TypeScript errors (`tsc --noEmit` must pass)
- Do NOT add a new dependency without updating `AGENTS.md` and `CLAUDE.md`
