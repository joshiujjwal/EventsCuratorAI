import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { logger } from '@lib/logger';
import { env } from '@config/env';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env['FRONTEND_URL'] ?? 'http://localhost:5173' }));
  app.use(express.json());

  // Health check — no auth required
  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'events-curator-ai', env: env.NODE_ENV });
  });

  // TODO: mount routes
  // app.use('/api/events', eventsRouter);
  // app.use('/api/users', usersRouter);
  // app.use('/api/recommendations', recommendationsRouter);
  // app.use('/api/ingestion', ingestionRouter);

  return app;
}

if (require.main === module) {
  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, '🚀 API server started');
  });
}
