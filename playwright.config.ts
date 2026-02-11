import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:4321',
  },
  webServer: {
    command: 'pnpm preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    // Build the site before starting preview
    // Run: pnpm build before test:e2e the first time, or use test:e2e:fresh
  },
});
