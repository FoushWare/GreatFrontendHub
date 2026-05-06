const nextJest = require("next/jest.js");
const path = require("node:path");

// Get the absolute path to the website directory
const websiteDir = path.resolve(__dirname);

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  // Use absolute path to ensure Next.js can find the app directory
  dir: websiteDir,
});

// Add any custom config to be passed to Jest
const config = {
  coverageProvider: "v8",
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "../../libs/common-ui/**/*.{js,jsx,ts,tsx}",
    "../../libs/utilities/**/*.{js,jsx,ts,tsx}",
    "!**/jest.*.js",
    "!**/vite.config.*",
    "!**/*.test.*",
    "!**/*.spec.*",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/__tests__/**",
    "!**/test-utils/**",
  ],
  testEnvironment: "jsdom",
  // Performance optimizations for 8GB RAM Mac M2
  // Use 1 worker for low memory systems, 2 for normal use
  maxWorkers: process.env.JEST_MAX_WORKERS
    ? Number.parseInt(process.env.JEST_MAX_WORKERS)
    : 1, // Default to 1 worker for 8GB RAM
  // Memory optimizations
  workerIdleMemoryLimit: "512MB", // Kill workers that exceed this memory
  // Cache settings - disable if memory is tight
  cache: process.env.JEST_NO_CACHE !== "true",
  cacheDirectory: "<rootDir>/.jest-cache",
  // Run tests in sequence for very low memory situations
  ...(process.env.JEST_RUN_IN_BAND === "true" ? { runInBand: true } : {}),
  // Log heap usage for debugging
  logHeapUsage: process.env.JEST_LOG_HEAP === "true",
  // Add more setup options before each test is run
  // `setupFiles` run before the test framework is installed and before modules are required.
  // Add the fetch pre-setup to ensure `global.fetch` exists during module import time.
  setupFiles: ["<rootDir>/jest.fetch.setup.js"],
  // Full setup for website tests (loads jest.setup.js which sets up env and shims)
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.js",
    "<rootDir>/../../tests/utils/jest-mock-msw.js",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@elzatona/contexts$": "<rootDir>/../../libs/contexts/src/index.ts",
    "^@elzatona/common-ui$": "<rootDir>/../../libs/common-ui/src/index.ts",
    "^@elzatona/hooks$": "<rootDir>/../../libs/hooks/src/index.ts",
    "^lucide-react$": "<rootDir>/test-utils/mocks/lucide-react.tsx",
    // Mock nuqs to avoid ESM issues in tests
    "^nuqs$": "<rootDir>/test-utils/mocks/nuqs.ts",
    // Mock shiki ESM module
    "^shiki$": "<rootDir>/test-utils/mocks/shiki.ts",
    "^shiki(/.*)?$": "<rootDir>/test-utils/mocks/shiki.ts",
    // Mock refractor ESM module (used by react-syntax-highlighter)
    "^refractor$": "<rootDir>/test-utils/mocks/refractor.ts",
    "^refractor(/.*)?$": "<rootDir>/test-utils/mocks/refractor.ts",
    // Provide a lightweight vitest shim for tests that import { vi } from 'vitest'
    "^vitest$": "<rootDir>/test-utils/mocks/vitest.js",
    "^nuqs(/.*)?$": "<rootDir>/test-utils/mocks/nuqs.ts",
    // Mock react-syntax-highlighter (ESM) to avoid ESM parsing issues in Jest
    "^react-syntax-highlighter(.*)?$":
      "<rootDir>/test-utils/mocks/react-syntax-highlighter.tsx",
    "^react-markdown$": "<rootDir>/test-utils/mocks/react-markdown.tsx",
    "^node-fetch$": "<rootDir>/../../tests/utils/node-fetch-mock.js",
    // Mock next and next/server imports to a lightweight NextRequest/NextResponse for unit tests
    "^next(/.*)?$": "<rootDir>/test-utils/mocks/next-server.js",
    "^next/server$": "<rootDir>/test-utils/mocks/next-server.js",
    // Resolve workspace-level tests utils when imported relatively from other packages
    "^tests/utils/mock-repositories$":
      "<rootDir>/../../tests/utils/mock-repositories.js",
    // Catch any relative import that ends with tests/utils/mock-repositories
    ".*tests/utils/mock-repositories$":
      "<rootDir>/../../tests/utils/mock-repositories.js",
    // Provide a jest-compatible mock for bcryptjs used in auth tests
    "^bcryptjs$": "<rootDir>/../../tests/utils/mocks/bcryptjs.js",
  },
  // Include tests from root tests directory, but exclude e2e tests (Playwright)
  // Note: testPathIgnorePatterns handles the exclusion, so we keep testMatch simple
  testMatch: [
    "<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}",
    "<rootDir>/../pages/**/*.{test,spec}.{js,jsx,ts,tsx}",
    "<rootDir>/../components/**/*.{test,spec}.{js,jsx,ts,tsx}",
    "<rootDir>/../../tests/**/*.{test,spec}.{js,jsx,ts,tsx}",
    "<rootDir>/../../libs/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],
  // Exclude e2e tests - these should only be run by Playwright
  // Jest uses regex patterns, so we match any path containing e2e
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/tests/e2e/", // Exclude e2e directory
    ".*/e2e/.*", // Exclude any path with /e2e/ in it
    String.raw`.*\.spec\.ts$`, // Exclude .spec.ts files (Playwright convention)
    String.raw`.*\.spec\.tsx$`, // Exclude .spec.tsx files (Playwright convention)
    ".*/tests/e2e/.*", // More specific pattern for e2e tests
    ".*e2e.*", // Catch-all for any path containing "e2e"
  ],
  // Allow tests outside the app directory
  roots: ["<rootDir>", "<rootDir>/../../tests", "<rootDir>/../../libs"],
  // Transform ESM modules - allow nuqs and other ESM packages
  // Need to include the full path for nuqs submodules
  // Note: shiki and refractor are mocked via moduleNameMapper, so we don't need to transform them
  transformIgnorePatterns: [
    "node_modules/(?!(nuqs|@supabase/supabase-js|@tanstack|@react-hook-form|lucide-react|@radix-ui|@radix-ui/react-select)/)",
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);
