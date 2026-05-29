import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
      include: ['src/**/*.ts'],
      exclude: ['src/config/env.ts', 'src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@api': resolve(__dirname, 'src/api'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@types': resolve(__dirname, 'src/types'),
      '@workers': resolve(__dirname, 'src/workers'),
      '@config': resolve(__dirname, 'src/config'),
    },
  },
});
