import { defineConfig, devices } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(__dirname, "../../.env.test.local") });
dotenv.config();

// Playwright configuration for website and admin E2E tests
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    video: "retain-on-failure",
    viewport: { width: 1280, height: 800 },
    actionTimeout: 0,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "website-e2e",
      use: {
        ...devices["Desktop Chrome"],
        baseURL:
          process.env.WEBSITE_BASE_URL ||
          process.env.BASE_URL ||
          "http://localhost:3000",
        storageState: "tests/.auth/website.json",
      },
    },
    {
      name: "admin-e2e",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.ADMIN_BASE_URL || "http://localhost:3001",
        storageState: "tests/.auth/admin.json",
      },
    },
    // Add browser variations if needed
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        baseURL: process.env.BASE_URL || "http://localhost:3000",
      },
    },
  ],
});
