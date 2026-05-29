# ADR 0002: Use Drizzle ORM over Prisma

**Date:** scaffolded  
**Status:** Accepted  
**Deciders:** joshiujjwal

---

## Context

The project needs a TypeScript ORM for PostgreSQL. The two dominant options for TS projects in 2024 are Prisma and Drizzle ORM.

---

## Decision

Use **Drizzle ORM** for all database access.

---

## Consequences

### Positive
- Schema defined in TypeScript (no separate `.prisma` schema file)
- Drizzle generates raw SQL migrations — easy to inspect and reason about
- Lighter runtime footprint (no query engine binary)
- SQL-first mindset: Drizzle exposes SQL-like query builder, easier for complex queries

### Negative
- Smaller ecosystem and fewer community resources than Prisma
- No built-in GUI (Prisma Studio equivalent is limited)
- Less mature tooling for seeding and testing utilities

### Risks
- Drizzle is newer — fewer battle-tested patterns in the community

---

## Alternatives Considered

| Option | Pros | Cons | Rejected Because |
|--------|------|------|-----------------|
| Prisma | Large community, great DX | Heavy binary, `.prisma` language, slower cold starts | Drizzle is more lightweight and schema-in-TS is preferable |
| Raw pg/postgres.js | Maximum control | High boilerplate, no type safety | Too much manual work for rapid iteration |
