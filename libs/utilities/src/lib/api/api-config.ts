/**
 * Centralized API Configuration Utility
 *
 * Single source of truth for all API environment-specific configuration.
 * Change APP_ENV in one place, and all APIs automatically use the correct settings.
 *
 * Usage:
 * ```ts
 * import { getApiConfig } from './api-config';
 *
 * const config = getApiConfig();
 * // Use config.supabaseUrl, config.headers, etc.
 * ```
 *
 * To switch environments, just set:
 *   APP_ENV=test        → Uses test database and settings
 *   APP_ENV=production  → Uses production database and settings
 */

import {
  getEnvironment,
  isTestEnvironment,
  isProductionEnvironment,
  isDevelopmentEnvironment,
} from "./environment";

export interface ApiConfig {
  // Environment info
  environment: "test" | "production" | "development";
  isTest: boolean;
  isProduction: boolean;
  isDevelopment: boolean;

  // Supabase configuration
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;

  // API headers
  headers: Record<string, string>;

  // Admin credentials
  adminEmail: string;
  adminPassword: string;

  // Feature flags
  enableDebugLogging: boolean;
  enableTestData: boolean;
  enableCaching: boolean;

  // API endpoints (if needed)
  apiBaseUrl: string;

  // Timeouts and limits
  requestTimeout: number;
  maxRetries: number;
}

/**
 * Get centralized API configuration based on current environment
 */
export function getApiConfig(): ApiConfig {
  const env = getEnvironment();
  const isTest = isTestEnvironment();
  const isProd = isProductionEnvironment();
  const isDev = isDevelopmentEnvironment();

  _validateTestEnvironment(isTest);

  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"] || "";
  const projectRef =
    /https?:\/\/([^.]+)\.supabase\.co/.exec(supabaseUrl)?.[1] || "unknown";

  const { adminEmail, adminPassword } = _getAdminCredentials(isTest, isDev);

  return {
    environment: env,
    isTest,
    isProduction: isProd,
    isDevelopment: isDev,
    supabaseUrl,
    supabaseAnonKey: process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] || "",
    supabaseServiceRoleKey: process.env["SUPABASE_SERVICE_ROLE_KEY"] || "",
    headers: _getEnvironmentHeaders(env, projectRef, isTest, isDev),
    adminEmail,
    adminPassword,
    enableDebugLogging: !isProd,
    enableTestData: isTest || isDev,
    enableCaching: isProd,
    apiBaseUrl: _getApiBaseUrl(),
    requestTimeout: isTest || isDev ? 30000 : 10000,
    maxRetries: isTest || isDev ? 3 : 2,
  };
}

function _validateTestEnvironment(isTest: boolean): void {
  if (!isTest) return;
  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"] || "";
  if (supabaseUrl.includes("hpnewqkvpnthpohvxcmq")) {
    console.error(
      "[API Config] ⚠️  WARNING: APP_ENV=test but using PRODUCTION project!",
    );
    console.error("[API Config] Actual:", supabaseUrl);
  }
}

function _getAdminCredentials(isTest: boolean, isDev: boolean) {
  const useTestCreds = isTest || isDev;
  return {
    adminEmail: useTestCreds
      ? process.env["ADMIN_EMAIL"] || process.env["INITIAL_ADMIN_EMAIL"] || ""
      : process.env["INITIAL_ADMIN_EMAIL"] || "",
    adminPassword: useTestCreds
      ? process.env["ADMIN_PASSWORD"] ||
        process.env["INITIAL_ADMIN_PASSWORD"] ||
        ""
      : process.env["INITIAL_ADMIN_PASSWORD"] || "",
  };
}

function _getEnvironmentHeaders(
  env: string,
  projectRef: string,
  isTest: boolean,
  isDev: boolean,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Environment": env,
    "X-Project-Ref": projectRef,
  };
  if (isTest) headers["X-Test-Mode"] = "true";
  if (isDev) headers["X-Dev-Mode"] = "true";
  return headers;
}

function _getApiBaseUrl(): string {
  if (process.env["NEXT_PUBLIC_API_URL"])
    return process.env["NEXT_PUBLIC_API_URL"];
  return globalThis.window === undefined
    ? "http://localhost:3000"
    : globalThis.window.location.origin;
}

/**
 * Get Supabase client configuration
 * Use this in your API routes to get the correct Supabase client
 *
 * @returns Supabase client configuration
 */
export function getSupabaseConfig() {
  const config = getApiConfig();

  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw new Error(
      `Supabase configuration missing for ${config.environment} environment. ` +
        `Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables.`,
    );
  }

  return {
    url: config.supabaseUrl,
    serviceRoleKey: config.supabaseServiceRoleKey,
    anonKey: config.supabaseAnonKey,
    headers: config.headers,
  };
}

/**
 * Get fetch configuration with environment-specific headers
 * Use this for all API calls to ensure correct headers
 *
 * @param additionalHeaders Optional additional headers to merge
 * @returns Fetch configuration object
 */
export function getFetchConfig(additionalHeaders?: Record<string, string>) {
  const config = getApiConfig();

  return {
    headers: {
      ...config.headers,
      ...additionalHeaders,
    },
    timeout: config.requestTimeout,
  };
}

/**
 * Log API configuration (for debugging)
 *
 * @param context Optional context (e.g., API route name)
 */
export function logApiConfig(context?: string): void {
  const config = getApiConfig();
  const prefix = context ? `[${context}]` : "[API Config]";

  console.log(`${prefix} Environment: ${config.environment.toUpperCase()}`);
  console.log(`${prefix} Project: ${config.headers["X-Project-Ref"]}`);
  console.log(`${prefix} Supabase: ${config.supabaseUrl.substring(0, 40)}...`);
  console.log(
    `${prefix} Debug Logging: ${config.enableDebugLogging ? "ON" : "OFF"}`,
  );
  console.log(
    `${prefix} Test Data: ${config.enableTestData ? "ENABLED" : "DISABLED"}`,
  );
}
