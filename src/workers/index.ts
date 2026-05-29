import { logger } from '@lib/logger';
import { QUEUES } from './queues';

// TODO: Initialize BullMQ workers here
// import { IngestionWorker } from './IngestionWorker';
// import { CurationWorker } from './CurationWorker';

logger.info({ queues: Object.values(QUEUES) }, '🔧 Workers starting...');

// TODO: Start workers
// new IngestionWorker().start();
// new CurationWorker().start();

logger.info('Workers initialized — waiting for jobs');
