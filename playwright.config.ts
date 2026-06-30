import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,               /* Enable parallel processing to speed up execution */
  forbidOnly: !!process.env.CI,      /* Prevent tests containing .only from being uploaded to CI */
  retries: process.env.CI ? 2 : 0,   /* Retry twice on GitHub Actions if the test fails */
  workers: process.env.CI ? 2 : undefined, /* Monitor the threads in CI to avoid overloading the agent */
  reporter: [
    ['html', { open: 'never' }],     /* Generate an HTML report without attempting to open it automatically */
    ['list']                         /* Display a clean log in the terminal */
  ],
  use: {
    baseURL: 'https://api.realworld.show', /* Base URL for the public UI */
    trace: 'retain-on-failure',             /* Record detailed traces only if the test fails */
    screenshot: 'only-on-failure',          /* Take screenshots if the test fails */
    video: 'on-first-retry',                /* Record a video if the test goes into a retry loop */
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});