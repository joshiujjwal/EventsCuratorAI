import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_URL_TEST: z.string().url().optional(),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1),

  // Auth0
  AUTH0_DOMAIN: z.string().min(1),
  AUTH0_AUDIENCE: z.string().min(1),

  // Eventbrite
  EVENTBRITE_API_KEY: z.string().optional(),

  // Meetup
  MEETUP_API_KEY: z.string().optional(),

  // Curation settings
  CURATION_CACHE_TTL_SECONDS: z.coerce.number().default(14400), // 4 hours
  CURATION_MAX_CANDIDATES: z.coerce.number().default(50),
  CURATION_TOKEN_BUDGET: z.coerce.number().default(4000),
  INGESTION_INTERVAL_HOURS: z.coerce.number().default(6),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(_env.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = _env.data;
export type Env = typeof env;
