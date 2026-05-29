# AGENTS.md — EventsCuratorAI

Standard agent instruction file (OpenAI Codex / GitHub Copilot Workspace).

---

## Setup

```bash
# 1. Install Node.js ≥ 20 and PostgreSQL ≥ 16 and Redis ≥ 7
# 2. Install dependencies
npm install

# 3. Copy env template and fill in secrets
cp .env.example .env

# 4. Run DB migrations
npm run db:migrate

# 5. Seed dev data
npm run db:seed

# 6. Start dev stack
npm run dev
```

---

## Before Writing Any Code

```bash
npm test           # must pass before you start
npm run typecheck  # must pass before you start
```

If tests are red on a clean checkout, fix them before proceeding. Do not assume they were already broken.

---

## Code Style (TypeScript + Node.js)

- **TypeScript strict mode** — no `any`, no `@ts-ignore` without an explanatory comment
- **ESLint + Prettier** enforced — run `npm run lint:fix` before committing
- **Imports**: use path aliases (`@lib/`, `@types/`, `@api/`), not relative `../../`
- **Async**: always `async/await`, never raw `.then()` chains
- **Error handling**: throw typed errors (`createHttpError`, custom Error subclasses); never swallow exceptions
- **Exports**: named exports only; no default exports (avoids import naming inconsistency)
- **File naming**: `camelCase.ts` for modules, `PascalCase.ts` for classes
- **No magic strings**: constants in dedicated `constants.ts` files or Zod enums

### React (Frontend)
- Functional components only — no class components
- Co-locate component, styles (Tailwind), and tests in same directory
- `React.FC` type annotation on all components
- No prop drilling > 2 levels — use React Query or Context
- All data fetching via React Query (`useQuery`, `useMutation`)

### API Design
- Route handlers are thin: validate → call service → return response
- All business logic in `src/api/services/`
- Return 201 for creates, 204 for interactions/deletes, 200 for reads

---

## Testing Protocol

**Red/Green TDD — non-negotiable:**

1. Write the test. Run it. It must fail.
2. Write the minimum implementation to make it pass.
3. Refactor if needed — tests must still pass.
4. Commit both test and implementation together.

```bash
npm test                   # unit tests — run after every change
npm run test:int           # integration — run before opening a PR
npm run test:coverage      # check coverage ≥ 80% on changed files
```

**Mocking rules:**
- Unit tests: mock all external I/O (`vi.mock('@lib/db')`, `vi.mock('@lib/openai')`)
- Integration tests: use real test DB, mock only external HTTP (use `nock`)
- Never mock the module under test

---

## PR Instructions

Every PR must include in the description:
1. **What changed** — one paragraph, no bullet soup
2. **Test evidence** — paste `npm test` output showing tests pass
3. **For API changes** — include a `curl` example or Postman screenshot
4. **For AI changes** — include a sample prompt + GPT response showing the new behavior

**PR rules:**
- One feature or fix per PR
- All CI checks must be green before requesting review
- Do not merge PRs that reduce test coverage below 80%
- Do not refactor unrelated code in the same PR — open a separate PR

---

## Architecture Quick Reference

```
Ingestion flow:    BullMQ cron → IngestionWorker → Adapter (Eventbrite/Meetup) → EventNormalizer → DB upsert
Curation flow:     ingestion complete | profile update → CurationWorker → CurationPromptBuilder → GPT-4o → CurationResponseParser → DB → cache
Request flow:      Client → Express → Auth middleware → Zod validation → Route handler → Service → DB/cache → Response
```

**Adding a new event source:**
1. Create `src/api/services/ingestion/<source>.ts` implementing `IngestionAdapter` interface
2. Register in `src/workers/IngestionWorker.ts` adapter map
3. Add source to Zod enum in `src/types/event.ts`
4. Write unit tests for the normalizer
5. Add to `docs/spec.md` and `TODO.md`
