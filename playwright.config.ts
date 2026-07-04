import { defineConfig, devices } from "@playwright/test";

const uiCommonOptions = {
  baseURL: "https://demo.realworld.show" /* Base URL for the public UI */
}

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,               /* Enable parallel processing to speed up execution */
  forbidOnly: !!process.env.CI,      /* Prevent tests containing .only from being uploaded to CI */
  retries: process.env.CI ? 2 : 0,   /* Retry twice on GitHub Actions if the test fails */
  workers: process.env.CI ? 2 : "50%", /* Monitor the threads in CI to avoid overloading the agent */
  reporter: [
    ["html", { open: "never" }],     /* Generate an HTML report without attempting to open it automatically */
    ["list"]                         /* Display a clean log in the terminal */
  ],
  use: {
    trace: "retain-on-failure",             /* Record detailed traces only if the test fails */
    screenshot: "only-on-failure",          /* Take screenshots if the test fails */
    video: "retain-on-failure",                /* Record a video if the test fails */
  },

  projects: [
    {
      name: "api-tests",
      testDir: "./tests/api",
      use: {
        baseURL: "https://api.realworld.show" /* Base URL for the public API */
      }
    },
    // Running tests on Desktop Chrome
    {
      name: "ui-chrome",
      testDir: "./tests/ui",
      use: {
        ...devices["Desktop Chrome"],
        ...uiCommonOptions
      }
    },
    // Running tests on Desktop Firefox
    {
      name: "ui-firefox",
      testDir: "./tests/ui",
      use: {
        ...devices["Desktop Firefox"],
        ...uiCommonOptions
      }
    }
  ],
});