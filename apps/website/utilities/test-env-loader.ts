/**
 * Test Environment Loader Utility (Legacy Utilities)
 * Automatically detects environment and loads appropriate configs.
 */

import { config } from "dotenv";
import { resolve } from "path";
import { getEnvironment, isTestEnvironment } from "./environment";

/**
 * Load environment variables based on current environment.
 */
export function loadTestEnvironment(): {
  environment: "test" | "production" | "development";
  loadedFiles: string[];
  isCI: boolean;
} {
  const isCI = !!process.env.CI || !!process.env.GITHUB_ACTIONS;
  const env = getEnvironment();
  const isTest = isTestEnvironment() || env === "test";

  const envFiles = _getEnvFiles(isCI, isTest, process.cwd());
  const loadedFiles = _loadFiles(isCI, envFiles);

  normalizeAdminCredentials();
  _forceTestEnv(isTest);
  _logEnvInfo(env, isCI, isTest, loadedFiles);

  return { environment: env, loadedFiles, isCI };
}

function _getEnvFiles(isCI: boolean, isTest: boolean, root: string): string[] {
  if (isCI) return [];
  return isTest
    ? [
        resolve(root, ".env.test.local"),
        resolve(root, ".env.test"),
        resolve(root, ".env.local"),
      ]
    : [resolve(root, ".env.local"), resolve(root, ".env")];
}

function _loadFiles(isCI: boolean, files: string[]): string[] {
  if (isCI) return [];
  const loaded: string[] = [];
  for (const file of files) {
    try {
      if (!config({ path: file, override: false }).error) loaded.push(file);
    } catch {
      /* ignore */
    }
  }
  return loaded;
}

function _forceTestEnv(isTest: boolean): void {
  if (isTest) {
    process.env.APP_ENV = "test";
    process.env.NEXT_PUBLIC_APP_ENV = "test";
    if (!process.env.NODE_ENV) (process.env as any).NODE_ENV = "test";
  }
}

function _logEnvInfo(
  env: string,
  isCI: boolean,
  isTest: boolean,
  loaded: string[],
): void {
  if (process.env.DEBUG_TEST_ENV === "true" || isCI) {
    console.log(`[Test Env Loader] Env: ${env}, CI: ${isCI}, Test: ${isTest}`);
    if (loaded.length)
      console.log(
        `[Test Env Loader] Loaded: ${loaded.map((f) => f.split("/").pop()).join(", ")}`,
      );
  }
}

export function normalizeAdminCredentials(): void {
  if (!process.env.ADMIN_EMAIL) {
    process.env.ADMIN_EMAIL =
      process.env.ADMAIN_EMAIL ||
      process.env.INITIAL_ADMIN_EMAIL ||
      process.env.TEST_ADMIN_EMAIL ||
      "";
  }
  if (!process.env.ADMIN_PASSWORD) {
    process.env.ADMIN_PASSWORD =
      process.env.INITIAL_ADMIN_PASSWORD ||
      process.env.TEST_ADMIN_PASSWORD ||
      "";
  }
  process.env.ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim();
  process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim();
}

export function getAdminCredentials(): { email: string; password: string } {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!email || !password)
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  return { email, password };
}
