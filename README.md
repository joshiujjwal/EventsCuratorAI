# EventsCuratorAI

> 🎟️ Aggregates events from multiple sources (Eventbrite, Meetup, Facebook Events, etc.) and uses AI to curate personalized recommendations based on user interests, location, and social graph.

![Status](https://img.shields.io/badge/status-🚧%20Early%20Development-orange)
![Stack](https://img.shields.io/badge/stack-TypeScript%20%7C%20React%20%7C%20Node.js%20%7C%20PostgreSQL%20%7C%20GPT--4o-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + Vite + TailwindCSS       |
| Backend     | Node.js + Express + TypeScript      |
| Database    | PostgreSQL 16 + Drizzle ORM         |
| AI/ML       | OpenAI GPT-4o (curation + ranking)  |
| Job Queue   | BullMQ + Redis                      |
| Auth        | Auth0 / JWT                         |
| Event APIs  | Eventbrite, Meetup, Facebook Events |
| Testing     | Vitest + Supertest + Playwright     |

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- PostgreSQL ≥ 16
- Redis ≥ 7
- An OpenAI API key (GPT-4o access)

### Install

```bash
git clone https://github.com/joshiujjwal/EventsCuratorAI.git
cd EventsCuratorAI
npm install
```

### Environment

```bash
cp .env.example .env
# Fill in: DATABASE_URL, OPENAI_API_KEY, REDIS_URL, AUTH0_*, EVENTBRITE_*, MEETUP_*
```

### Development

```bash
# Run DB migrations
npm run db:migrate

# Start API + frontend dev servers
npm run dev

# Run workers (event ingestion + AI curation)
npm run workers
```

### Test

```bash
npm test              # unit tests
npm run test:int      # integration tests (needs DB + Redis)
npm run test:e2e      # end-to-end (needs full stack running)
```

### Lint & Type-check

```bash
npm run lint
npm run typecheck
```

---

## Project Structure

```
EventsCuratorAI/
├── src/
│   ├── api/
│   │   ├── routes/          # Express route handlers (events, users, recommendations)
│   │   ├── middleware/       # Auth, rate-limit, validation
│   │   └── services/        # Business logic (ingestion, curation, ranking)
│   ├── workers/             # BullMQ workers (source polling, AI curation jobs)
│   ├── lib/                 # Shared utilities (openai client, db client, logger)
│   ├── types/               # Shared TypeScript interfaces
│   └── config/              # Environment + feature flags
├── tests/
│   ├── unit/                # Pure logic tests (no I/O)
│   ├── integration/         # API + DB tests
│   └── e2e/                 # Playwright browser tests
├── db/
│   ├── migrations/          # Drizzle SQL migrations
│   └── seeds/               # Dev seed data
├── docs/
│   ├── spec.md              # Feature specification
│   └── adr/                 # Architecture Decision Records
├── .github/
│   ├── copilot-instructions.md
│   ├── instructions/
│   └── skills/
├── README.md
├── TODO.md
├── CLAUDE.md
└── AGENTS.md
```

---

## Contributing

- **Red/Green TDD only** — write a failing test before any implementation
- **PRs require evidence** — paste test output, screenshots, or API logs in the PR description
- **Small focused PRs** — one feature or fix per PR; reviewers should be able to understand it in < 10 minutes
- **Update AI config files** — if you discover a new convention, add it to `CLAUDE.md` or `AGENTS.md` before merging
- **No commented-out code** — if it's not needed, delete it
