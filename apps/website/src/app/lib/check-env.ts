/**
 * Quick Environment Check Utility
 *
 * Run this script to check which environment is currently active
 *
 * Usage:
 *   npx tsx apps/website/src/lib/utils/check-env.ts
 *   or
 *   node -r ts-node/register apps/website/src/lib/utils/check-env.ts
 */

import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { maskEmail } from "@elzatona/utilities";
import {
  getEnvironment,
  isTestEnvironment,
  isProductionEnvironment,
  isDevelopmentEnvironment,
  getEnvironmentInfo,
  getSupabaseProjectRef,
  getEnvironmentConfig,
} from "./environment";

// Load environment variables
const projectRoot = resolve(__dirname, "../../../../");
const envFiles = [
  resolve(projectRoot, ".env.test.local"),
  resolve(projectRoot, ".env.test"),
  resolve(projectRoot, ".env.local"),
  resolve(projectRoot, ".env"),
];

for (const envFile of envFiles) {
  try {
    config({ path: envFile, override: false });
  } catch (error) {
    // File doesn't exist, that's okay
    console.debug("Unable to load env file:", envFile, error);
  }
}

console.log("🔍 Environment Check");
console.log("===================\n");

// Get environment info
const env = getEnvironment();
const info = getEnvironmentInfo();
const config_data = getEnvironmentConfig();

console.log("📊 Current Environment:");
console.log(`   Environment: ${env.toUpperCase()}`);
console.log(`   Is Test: ${isTestEnvironment() ? "✅ YES" : "❌ NO"}`);
console.log(
  `   Is Production: ${isProductionEnvironment() ? "✅ YES" : "❌ NO"}`,
);
console.log(
  `   Is Development: ${isDevelopmentEnvironment() ? "✅ YES" : "❌ NO"}`,
);
console.log("");

console.log("🔗 Supabase Configuration:");
console.log(`   Project Reference: ${getSupabaseProjectRef() || "Not found"}`);
console.log(`   URL: ${info.supabaseUrl || "Not configured"}`);
console.log(
  `   Has Anon Key: ${config_data.supabaseAnonKey ? "✅ YES" : "❌ NO"}`,
);
console.log(
  `   Has Service Role Key: ${config_data.supabaseServiceRoleKey ? "✅ YES" : "❌ NO"}`,
);
console.log("");

console.log("⚙️  Environment Variables:");
console.log(`   NODE_ENV: ${process.env.NODE_ENV || "not set"}`);
console.log(
  `   NEXT_PUBLIC_APP_ENV: ${process.env.NEXT_PUBLIC_APP_ENV || "not set"}`,
);
console.log("");

console.log("👤 Admin Configuration:");
console.log(
  `   Admin Email: ${config_data.adminEmail ? maskEmail(config_data.adminEmail) : "not set"}`,
);
console.log(
  `   Has Admin Password: ${config_data.adminPassword ? "✅ YES" : "❌ NO"}`,
);
console.log("");

console.log("🎛️  Feature Flags:");
console.log(
  `   Debug Logging: ${config_data.enableDebugLogging ? "✅ ENABLED" : "❌ DISABLED"}`,
);
console.log(
  `   Test Data: ${config_data.enableTestData ? "✅ ENABLED" : "❌ DISABLED"}`,
);
console.log("");

// Determine which environment file is being used
const loadedFiles: string[] = [];
for (const envFile of envFiles) {
  if (existsSync(envFile)) {
    loadedFiles.push(envFile);
  }
}

console.log("📁 Environment Files Found:");
if (loadedFiles.length > 0) {
  loadedFiles.forEach((file) => {
    const fileName = file.split("/").pop();
    const isTest = file.includes(".test");
    const isLocal = file.includes(".local");
    let priority = "4️⃣ ";
    if (isTest && isLocal) {
      priority = "1️⃣  (Highest Priority)";
    } else if (isTest) {
      priority = "2️⃣ ";
    } else if (isLocal) {
      priority = "3️⃣ ";
    }
    console.log(`   ${priority} ${fileName}`);
  });
} else {
  console.log("   ⚠️  No environment files found");
}
console.log("");

// Final summary
console.log("📋 Summary:");
if (isTestEnvironment()) {
  console.log("   🧪 You are in TEST environment");
  console.log("   📊 Using test database: vopfdukvdhnmzzjkxpnj");
  console.log("   ⚠️  All operations will use the test database");
} else if (isProductionEnvironment()) {
  console.log("   🚀 You are in PRODUCTION environment");
  console.log("   📊 Using production database: hpnewqkvpnthpohvxcmq");
  console.log("   ⚠️  All operations will use the production database");
} else {
  console.log("   🔧 You are in DEVELOPMENT environment");
  console.log("   📊 Environment detection unclear - check your .env files");
}
console.log("");
