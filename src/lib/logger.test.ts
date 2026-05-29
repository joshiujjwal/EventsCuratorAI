import { describe, it, expect, vi } from 'vitest';

// Smoke test: logger module exports a structured logger
describe('logger', () => {
  it('exports a logger with info and error methods', async () => {
    const { logger } = await import('./logger');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.warn).toBe('function');
  });

  it('logger has the correct service base field', async () => {
    // We validate that the logger was constructed with base.service
    const { logger } = await import('./logger');
    // pino stores bindings; just verify it's a pino instance (has bindings method)
    expect(typeof logger.bindings).toBe('function');
    const bindings = logger.bindings();
    expect(bindings['service']).toBe('events-curator-ai');
  });
});
