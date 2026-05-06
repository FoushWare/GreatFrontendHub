/**
 * Environment Detection Utility
 *
 * Determines if the application is running in TEST or PRODUCTION environment.
 * All API routes should use this utility to ensure they're using the correct database.
 *
 * Detection Logic:
 * - Checks NODE_ENV and NEXT_PUBLIC_APP_ENV
 * - Checks Supabase URL to identify test vs production project
 * - Test project: vopfdukvdhnmzzjkxpnj.supabase.co
 * - Production project: hpnewqkvpnthpohvxcmq.supabase.co
 *
 * @example
 * ```ts
 * import { isTestEnvironment, getEnvironment } from './environment';
 *
 * if (isTestEnvironment()) {
 *   // Use test database logic
 * } else {
 *   // Use production database logic
 * }
 * ```
 */

// Test project reference (from .env.test.local)
// Current test project: zatona-web-testing
const TEST_PROJECT_REF = "kiycimlsatwfqxtfprlr";
// Old test projects (kept for backwards compatibility)
const OLD_TEST_PROJECT_REF_1 = "slfyltsmcivmqfloxpmq";
const OLD_TEST_PROJECT_REF_2 = "vopfdukvdhnmzzjkxpnj";
// Production project reference (from .env.local)
const PRODUCTION_PROJECT_REF = "hpnewqkvpnthpohvxcmq";

export type Environment = "test" | "production" | "development";

/**
 * Get the current environment based on multiple indicators
 */
export function getEnvironment(): Environment {
  const checkEnv = (val?: string) => {
    const v = val?.toLowerCase();
    if (v === "test") return "test";
    if (v === "production" || v === "prod") return "production";
    if (v === "development" || v === "dev") return "development";
    return null;
  };

  return (
    checkEnv(process.env["APP_ENV"]) ||
    checkEnv(process.env["NEXT_PUBLIC_APP_ENV"]) ||
    checkEnv(process.env["NODE_ENV"]) ||
    _getEnvironmentFromUrl() ||
    "development"
  );
}

/**
 * Internal helper to determine environment from Supabase URL
 */
function _getEnvironmentFromUrl(): Environment | null {
  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"] || "";
  if (
    supabaseUrl.includes(TEST_PROJECT_REF) ||
    supabaseUrl.includes(OLD_TEST_PROJECT_REF_1) ||
    supabaseUrl.includes(OLD_TEST_PROJECT_REF_2)
  ) {
    return "test";
  }
  if (supabaseUrl.includes(PRODUCTION_PROJECT_REF)) {
    return "production";
  }
  return null;
}

/**
 * Check if we're running in TEST environment
 *
 * @returns true if in test environment, false otherwise
 */
export function isTestEnvironment(): boolean {
  return getEnvironment() === "test";
}

/**
 * Check if we're running in PRODUCTION environment
 *
 * @returns true if in production environment, false otherwise
 */
export function isProductionEnvironment(): boolean {
  return getEnvironment() === "production";
}

/**
 * Check if we're running in DEVELOPMENT environment
 *
 * @returns true if in development environment, false otherwise
 */
export function isDevelopmentEnvironment(): boolean {
  return getEnvironment() === "development";
}

/**
 * Get the current Supabase project reference from the URL
 *
 * @returns project reference (e.g., 'vopfdukvdhnmzzjkxpnj') or null
 */
export function getSupabaseProjectRef(): string | null {
  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  if (!supabaseUrl) return null;

  // Extract project reference from URL
  // Format: https://[project-ref].supabase.co
  const match = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : null;
}

/**
 * Get environment information for logging/debugging
 *
 * @returns Object with environment details
 */
export function getEnvironmentInfo() {
  const env = getEnvironment();
  const projectRef = getSupabaseProjectRef();
  const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];

  return {
    environment: env,
    isTest: isTestEnvironment(),
    isProduction: isProductionEnvironment(),
    isDevelopment: isDevelopmentEnvironment(),
    projectRef,
    supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : null,
    nodeEnv: process.env["NODE_ENV"],
    appEnv: process.env["NEXT_PUBLIC_APP_ENV"],
  };
}

/**
 * Log environment information (useful for debugging)
 *
 * @param context Optional context string (e.g., API route name)
 */
export function logEnvironment(context?: string): void {
  const info = getEnvironmentInfo();
  const prefix = context ? `[${context}]` : "[Environment]";

  console.log(`${prefix} Environment: ${info.environment.toUpperCase()}`);
  console.log(`${prefix} Project: ${info.projectRef || "unknown"}`);
  console.log(`${prefix} Supabase: ${info.supabaseUrl || "not configured"}`);

  if (info.isTest) {
    console.log(`${prefix} ⚠️  Running in TEST mode - using test database`);
  } else if (info.isProduction) {
    console.log(
      `${prefix} 🚀 Running in PRODUCTION mode - using production database`,
    );
  } else {
    console.log(`${prefix} 🔧 Running in DEVELOPMENT mode`);
  }
}

/**
 * Assert that we're in the expected environment
 * Throws an error if the environment doesn't match
 *
 * @param expectedEnvironment The expected environment
 * @param errorMessage Optional custom error message
 * @throws Error if environment doesn't match
 *
 * @example
 * ```ts
 * assertEnvironment('test', 'This API should only run in test environment');
 * ```
 */
export function assertEnvironment(
  expectedEnvironment: Environment,
  errorMessage?: string,
): void {
  const currentEnv = getEnvironment();

  if (currentEnv !== expectedEnvironment) {
    const message =
      errorMessage ||
      `Expected environment '${expectedEnvironment}' but got '${currentEnv}'`;
    throw new Error(message);
  }
}

/**
 * Get environment-specific configuration
 *
 * @returns Configuration object based on current environment
 */
export function getEnvironmentConfig() {
  const env = getEnvironment();
  const isTest = isTestEnvironment();

  return {
    environment: env,
    isTest,
    isProduction: isProductionEnvironment(),
    // Database configuration
    supabaseUrl: process.env["NEXT_PUBLIC_SUPABASE_URL"],
    supabaseAnonKey: process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    supabaseServiceRoleKey: process.env["SUPABASE_SERVICE_ROLE_KEY"],
    // Admin configuration
    adminEmail: isTest
      ? process.env["ADMIN_EMAIL"] || process.env["INITIAL_ADMIN_EMAIL"]
      : process.env["INITIAL_ADMIN_EMAIL"],
    adminPassword: isTest
      ? process.env["ADMIN_PASSWORD"] || process.env["INITIAL_ADMIN_PASSWORD"]
      : process.env["INITIAL_ADMIN_PASSWORD"],
    // Feature flags
    enableDebugLogging: !isProductionEnvironment(),
    enableTestData: isTest,
  };
}
