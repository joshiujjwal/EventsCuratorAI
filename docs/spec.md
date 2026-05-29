# EventsCuratorAI — Feature Specification

_Last updated: scaffolded_  
_Status: Draft — not yet approved_

---

## 1. Overview

**Problem:** Discovering local events is fragmented. Users must check Eventbrite, Meetup, Facebook Events, and others separately. There is no unified, personalized view.

**Solution:** EventsCuratorAI ingests events from multiple sources, normalizes them into a unified schema, and uses GPT-4o to generate personalized, ranked recommendations based on each user's stated interests, location, past interactions, and social context.

**Success criteria:**
- A user logs in, sets interests + location, and sees ≥ 10 relevant events within 30 seconds
- Recommendations feel noticeably better than a simple keyword/radius filter
- The system stays synced with source APIs within 6 hours of a new event being posted

---

## 2. Functional Requirements

### 2.1 Event Ingestion
- [ ] Poll Eventbrite API every 6 hours for events within configurable radius of each active user's location
- [ ] Poll Meetup GraphQL API every 6 hours
- [ ] Stub Facebook Events adapter (blocked on Meta app review)
- [ ] Normalize all events to internal schema (see §4)
- [ ] Deduplicate by `(source, external_id)` — upsert, never duplicate
- [ ] Store raw payload alongside normalized record for debugging
- [ ] Record each ingestion run: source, status, events_fetched, events_new, duration

### 2.2 AI Curation
- [ ] Generate personalized recommendations for each user using GPT-4o
- [ ] Prompt includes: user interests (tags), location, interaction history (saved/ignored events), time-of-year context
- [ ] GPT-4o returns JSON: `{ event_id, score (0–1), reasoning (1 sentence) }`
- [ ] Validate GPT response with Zod; retry once on schema failure; fall back to geo+interest filter on second failure
- [ ] Cache recommendations per user for 4 hours; bust cache on new interaction or profile update
- [ ] Log token usage per curation run for cost tracking

### 2.3 User Profile
- [ ] User signs in via Auth0 (Google + email/password providers)
- [ ] User sets: interests (free-form tags, ≤ 20), home location (city or lat/lng), search radius (km)
- [ ] User can interact with events: save, ignore, mark-as-attending
- [ ] Interaction history is used as implicit feedback for next curation cycle

### 2.4 API
- [ ] All endpoints require JWT auth except `/healthz`
- [ ] Paginated event list with filters: category, date range, radius, source
- [ ] Recommendations endpoint returns sorted list with per-item reasoning
- [ ] Interactions endpoint persists user actions

### 2.5 Frontend
- [ ] Event card: title, date/time, location, source badge, organizer, CTA to original URL
- [ ] Recommendation feed: ranked list with AI reasoning visible on hover/tap
- [ ] Filter sidebar: category checkboxes, date range picker, radius slider
- [ ] Profile editor: interest tag input, location picker (geocoded)
- [ ] Ingestion status indicator (last sync time per source)

---

## 3. Non-Functional Requirements

- [ ] API p99 latency < 200ms for cached endpoints; < 2s for live GPT calls
- [ ] Uptime ≥ 99.5% (excluding planned maintenance)
- [ ] Event data ≤ 6 hours stale
- [ ] Frontend First Contentful Paint < 1.5s on 4G
- [ ] No PII stored beyond what's necessary (email, location); no social graph data stored without explicit consent
- [ ] OpenAI API cost < $0.10 per user per day at scale (enforce token budget per curation run)

---

## 4. Data Models

### `events`
| Column        | Type                  | Notes                                       |
|---------------|-----------------------|---------------------------------------------|
| id            | UUID PK               | Internal ID                                 |
| title         | TEXT NOT NULL         |                                             |
| description   | TEXT                  |                                             |
| start_at      | TIMESTAMPTZ NOT NULL  |                                             |
| end_at        | TIMESTAMPTZ           | Nullable for open-ended events              |
| location_name | TEXT                  | Human-readable venue name                  |
| lat           | NUMERIC(9,6)          |                                             |
| lng           | NUMERIC(9,6)          |                                             |
| category      | TEXT                  | Normalized category tag                     |
| source        | TEXT NOT NULL         | `eventbrite` \| `meetup` \| `facebook`      |
| external_id   | TEXT NOT NULL         | ID from source system                       |
| url           | TEXT                  | Original event URL                          |
| image_url     | TEXT                  |                                             |
| organizer     | TEXT                  |                                             |
| raw_payload   | JSONB                 | Original API response for debugging         |
| created_at    | TIMESTAMPTZ           | DEFAULT now()                               |
| updated_at    | TIMESTAMPTZ           | DEFAULT now()                               |

Unique constraint: `(source, external_id)`

### `users`
| Column        | Type          | Notes                                   |
|---------------|---------------|-----------------------------------------|
| id            | UUID PK       |                                         |
| auth0_id      | TEXT UNIQUE   |                                         |
| email         | TEXT UNIQUE   |                                         |
| display_name  | TEXT          |                                         |
| interests     | TEXT[]        | Array of interest tags                  |
| home_lat      | NUMERIC(9,6)  |                                         |
| home_lng      | NUMERIC(9,6)  |                                         |
| search_radius | INT           | km, default 25                          |
| created_at    | TIMESTAMPTZ   | DEFAULT now()                           |

### `user_event_interactions`
| Column     | Type        | Notes                                          |
|------------|-------------|------------------------------------------------|
| id         | UUID PK     |                                                |
| user_id    | UUID FK     | → users.id                                     |
| event_id   | UUID FK     | → events.id                                    |
| action     | TEXT        | `view` \| `save` \| `ignore` \| `attend`       |
| created_at | TIMESTAMPTZ | DEFAULT now()                                  |

Unique constraint: `(user_id, event_id, action)`

### `recommendations`
| Column       | Type        | Notes                           |
|--------------|-------------|---------------------------------|
| id           | UUID PK     |                                 |
| user_id      | UUID FK     | → users.id                      |
| event_id     | UUID FK     | → events.id                     |
| score        | NUMERIC(4,3)| 0.000–1.000                     |
| reasoning    | TEXT        | One-sentence GPT explanation    |
| generated_at | TIMESTAMPTZ | When this recommendation was made |

### `ingestion_runs`
| Column         | Type        | Notes                              |
|----------------|-------------|------------------------------------|
| id             | UUID PK     |                                    |
| source         | TEXT        | `eventbrite` \| `meetup` etc.      |
| status         | TEXT        | `running` \| `success` \| `failed` |
| events_fetched | INT         |                                    |
| events_new     | INT         |                                    |
| error_message  | TEXT        | Nullable                           |
| started_at     | TIMESTAMPTZ |                                    |
| completed_at   | TIMESTAMPTZ | Nullable                           |

---

## 5. API Interface

### Authentication
All requests include `Authorization: Bearer <jwt>` except `/healthz`.

### Endpoints

```
GET    /healthz                          → { status: "ok", db: "ok", redis: "ok" }

POST   /api/auth/callback                → { user, token }

GET    /api/users/me                     → UserProfile
PATCH  /api/users/me                     → UserProfile  body: { interests?, home_lat?, home_lng?, search_radius? }

GET    /api/events                       → PaginatedEvents  ?page&limit&category&from&to&radius&source
GET    /api/events/:id                   → EventDetail + similar[]
POST   /api/events/:id/interact          → 204  body: { action: "save"|"ignore"|"attend" }

GET    /api/recommendations              → Recommendation[]  (cached 4h)

GET    /api/ingestion/status             → IngestionStatus[]  (one per source)
```

### GPT-4o Curation Prompt Contract

**System prompt (template):**
```
You are an event curation assistant. Given a user profile and a list of candidate events,
return a JSON array of recommendations sorted by relevance.
Each item: { "event_id": string, "score": number (0–1), "reasoning": string (max 20 words) }
Only include events with score >= 0.4. Return valid JSON only, no prose.
```

**User prompt includes:**
- User interests array
- Home location (city name, not lat/lng for privacy)
- Count of past interactions per category (implicit feedback)
- Candidate event list (id, title, category, date, location_name) — max 50 events per call

---

## 6. Test Plan

### Unit Tests
- `EventNormalizer`: maps Eventbrite fixture → internal Event (all fields correctly mapped)
- `EventNormalizer`: maps Meetup fixture → internal Event
- `CurationPromptBuilder`: given profile + events → prompt contains interest keywords, location, and all event IDs
- `CurationResponseParser`: valid GPT JSON → typed Recommendation array
- `CurationResponseParser`: invalid GPT JSON → throws ParseError (triggers fallback)
- Deduplication logic: two events with same `(source, external_id)` → upsert not duplicate
- Fallback ranker: no GPT → events sorted by (interest overlap + distance)

### Integration Tests
- `POST /api/events/:id/interact` persists interaction and busts recommendation cache
- `PATCH /api/users/me` with new interests triggers curation re-run job
- Ingestion worker: mock Eventbrite API (nock) → events saved, ingestion_run recorded
- Recommendation cache: second call within 4h hits cache (no DB query)

### E2E Tests (Playwright)
- Login → set interests + location → view recommendations feed → save event → refresh → saved event shown in "My Events"
- Filter events by category → list updates, URL reflects filter state
- Profile update with new interests → recommendations update after curation re-run

---

## 7. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Facebook Events API: is a Meta app review feasible for MVP? | Product | Open |
| 2 | Should recommendations be generated proactively (scheduled) or lazily (on request)? | Eng | Open — default: lazy with background pre-warm |
| 3 | What is the acceptable token cost ceiling per user/day? | Product | Open — placeholder: $0.10 |
| 4 | Do we need social graph features (friends' events) for v1? | Product | Deferred to Parking Lot |
| 5 | Auth0 vs. self-hosted auth (Supabase Auth)? | Eng | Open — default: Auth0 for speed |
