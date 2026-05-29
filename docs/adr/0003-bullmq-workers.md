# ADR 0003: Use BullMQ for Job Queue

**Date:** scaffolded  
**Status:** Accepted  
**Deciders:** joshiujjwal

---

## Context

Event ingestion and AI curation are async, long-running operations that must not block the API request cycle. They need scheduling (cron), retry logic, and visibility into job status.

---

## Decision

Use **BullMQ** (backed by Redis) for the job queue managing ingestion and curation jobs.

---

## Consequences

### Positive
- Built-in cron scheduling, retry with backoff, and job priority
- Redis-backed — works well with the Redis instance already needed for API caching
- Rich job visibility via BullMQ UI (Bull Board)
- TypeScript native

### Negative
- Adds Redis as a hard runtime dependency
- Workers must run as a separate process (or be co-located with the API)

### Risks
- Redis outage stops ingestion and curation jobs (mitigated: ingestion is best-effort, not real-time)

---

## Alternatives Considered

| Option | Pros | Cons | Rejected Because |
|--------|------|------|-----------------|
| pg-boss | Postgres-only, no extra infra | Less mature, no cron | Already using Redis for cache anyway |
| Temporal | Durable workflows, great retry | Heavy infrastructure, steep learning curve | Over-engineered for MVP |
| AWS SQS | Managed, reliable | Cloud-only, adds AWS dependency | Prefer self-hostable for local dev |
