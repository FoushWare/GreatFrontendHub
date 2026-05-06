import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";
import { requireTestEnvironment } from "../e2e/validate-test-env";

// Check if we're in CI (GitHub Actions)
const isCI =
  process.env.CI === "true" ||
  process.env.GITHUB_ACTIONS === "true" ||
  !!process.env.TEST_SUPABASE_URL;

// CRITICAL: .env.test.local is REQUIRED for E2E tests (local only)
// In CI, environment variables come from GitHub Secrets
const projectRoot = process.cwd();
const testEnvFile = resolve(projectRoot, ".env.test.local");

// In local development, .env.test.local is REQUIRED
if (!isCI) {
  // Check if .env.test.local exists
  if (!existsSync(testEnvFile)) {
    console.error("❌ CRITICAL: .env.test.local file is missing!");
    console.error(`   Location: ${testEnvFile}`);
    console.error("\n📝 To fix:");
    console.error("   1. Copy .env.test.local.example to .env.test.local");
    console.error("   2. Fill in your TEST Supabase project credentials");
    console.error(`   3. File location: ${testEnvFile}\n`);
    throw new Error(
      "E2E tests require .env.test.local file. Please create it from .env.test.local.example",
    );
  }

  // Load .env.test.local first (REQUIRED)
  const testEnvResult = config({ path: testEnvFile });
  if (testEnvResult.error) {
    console.error("❌ CRITICAL: Failed to load .env.test.local");
    console.error(`   File: ${testEnvFile}`);
    console.error(`   Error: ${testEnvResult.error.message}`);
    throw new Error(
      `Failed to load .env.test.local: ${testEnvResult.error.message}`,
    );
  }
} else {
  // CI: Check that required environment variables are set (from GitHub Secrets)
  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error("❌ CRITICAL: CI environment is missing required variables:");
    console.error(`   ${missingVars.join(", ")}`);
    console.error("\n📝 To fix:");
    console.error("   1. Ensure GitHub Secrets are set in repository settings");
    console.error(
      "   2. Required secrets: TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, TEST_SUPABASE_SERVICE_ROLE_KEY",
    );
    throw new Error(
      `CI environment missing required variables: ${missingVars.join(", ")}`,
    );
  }
}

// Load other env files as fallback (lower priority) - only in local dev
const loadedFiles: string[] = [];
if (!isCI) {
  loadedFiles.push(testEnvFile); // Track that we loaded .env.test.local

  const envFiles = [
    resolve(projectRoot, ".env.test"), // Test-specific defaults
    resolve(projectRoot, ".env.local"), // Fallback to dev (for backwards compatibility)
  ];

  for (const envFile of envFiles) {
    try {
      const result = config({ path: envFile, override: false }); // Don't override, respect priority
      if (!result.error) {
        loadedFiles.push(envFile);
      }
    } catch (_error) {
      // File doesn't exist, that's okay
    }
  }
}

// CRITICAL: Validate test environment configuration
// This will throw an error if environment is misconfigured
try {
  requireTestEnvironment();
} catch (error) {
  console.error("\n❌ E2E Test Environment Validation Failed");
  throw error;
}

// FORCE TEST ENVIRONMENT for all E2E tests
// This ensures E2E tests ALWAYS use test database, regardless of other settings
// Only set environment variables if not in build context
if (process.env.NODE_ENV !== "production" && !process.env.NEXT_PHASE) {
  process.env.APP_ENV = "test";
  process.env.NEXT_PUBLIC_APP_ENV = "test";
  // NODE_ENV is read-only in some environments, only set if not already set
  if (!process.env.NODE_ENV) {
    (process.env as any).NODE_ENV = "test";
  }
}

// Debug: Log loaded admin credentials and environment info
if (process.env.ADMIN_EMAIL) {
  console.log(
    `[Config] ✅ ADMIN_EMAIL loaded: ${process.env.ADMIN_EMAIL.substring(0, 10)}...`,
  );
} else {
  console.warn(`[Config] ⚠️  ADMIN_EMAIL not found in test environment files`);
}

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isTestEnv = loadedFiles.some((f) => f.includes(".env.test"));
  console.log(
    `[Config] 📊 Using Supabase: ${supabaseUrl.substring(0, 30)}... (${isTestEnv ? "TEST" : "DEV"} environment)`,
  );
} else {
  console.warn(`[Config] ⚠️  NEXT_PUBLIC_SUPABASE_URL not found`);
}

if (loadedFiles.length > 0 && process.env.DEBUG_TEST_ENV === "true") {
  console.log(`[Config] 📁 Loaded environment files:`, loadedFiles);
}

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "../e2e",
  /* Run tests in files in parallel - DISABLED for 8GB RAM */
  fullyParallel: false, // Disabled for 8GB RAM Mac
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Use 1 worker for 8GB RAM Mac - prevents OOM errors */
  workers: process.env.CI ? 1 : 1, // Always use 1 worker for memory efficiency
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html"],
    ["json", { outputFile: "test-results/e2e-results.json" }],
    ["junit", { outputFile: "test-results/e2e-results.xml" }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure - kept only for failed tests, auto-removed on success */
    video: "retain-on-failure", // Record videos for failed tests only, auto-cleanup on success
  },

  /* Configure projects for major browsers - CHROME and EDGE for testing */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "msedge",
      use: {
        ...devices["Desktop Edge"],
        // Edge uses Chromium engine, so it should be compatible
        // Add any Edge-specific settings here if needed
      },
    },

    /* Other browsers disabled for faster test execution - uncomment if needed */
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.CI
    ? undefined // In CI, server is started manually in workflow
    : {
        // Use dev:light:test to ensure Next.js loads .env.test.local for test database
        command: "npm run dev:website:test", // Use light mode for 8GB RAM with test environment
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120 * 1000, // 2 minutes
        env: {
          // CRITICAL: Force test environment to ensure test database is used
          APP_ENV: "test",
          NEXT_PUBLIC_APP_ENV: "test",
          NODE_ENV: "test",
        },
      },

  /* Global setup and teardown */
  globalSetup: require.resolve("../e2e/global-setup.ts"),
  globalTeardown: require.resolve("../e2e/global-teardown.ts"),

  /* Test timeout - increased for E2E tests that may need more time */
  timeout: 60 * 1000, // 60 seconds

  /* Expect timeout */
  expect: {
    timeout: 10 * 1000, // 10 seconds
  },

  /* Output directory for test artifacts */
  // Test results (videos, screenshots, traces) - ignored by git
  outputDir: "test-results/",
});
