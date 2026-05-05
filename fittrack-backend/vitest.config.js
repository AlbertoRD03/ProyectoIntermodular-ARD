import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      all: true,
      reportsDirectory: 'coverage',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.js'],
      exclude: [
        'src/app.js',
        'src/server.js',
        'src/config/**',
        'src/models/**',
        'src/routes/**',
        'src/scripts/**',
        'src/utils/**',
        'src/middlewares/error.middleware.js',
        'src/middlewares/validator.middleware.js'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
