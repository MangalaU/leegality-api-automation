
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',

  // Shared sandbox: start conservatively.
  fullyParallel: false,
  workers: 1,

  // Do not silently hide failures with retries.
  retries: 0,

  timeout: 30_000,

  expect: {
    timeout: 5_000,
  },

  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: 'reports/html',
        open: 'never',
      },
    ],
  ],

  use: {
    baseURL: process.env.BASE_URL,

    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  },

  outputDir: 'test-results/',
});
