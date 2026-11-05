import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export default defineConfig({
  testDir: './tests',

  // Shared public sandbox, so keep requests sequential
  fullyParallel: false,
  workers: 1,

  // No retries: a flaky API test should be visible, not hidden
  retries: 0,

  // Stops a stray test.only from being committed and skipping the rest
  forbidOnly: !!process.env.CI,

  timeout: 30_000,

  expect: {
    timeout: 5_000,
  },

  reporter: [
    [process.env.CI ? 'github' : 'list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
  ],

  use: {
    baseURL: process.env.BASE_URL,

    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },

    // Trace keeps every request/response of a failed test, viewable from the report
    trace: 'retain-on-failure',
  },

  outputDir: 'test-results/',
});
