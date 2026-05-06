import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getEnvironment,
  isTestEnvironment,
  getSupabaseProjectRef,
  assertEnvironment,
  getEnvironmentConfig,
  logEnvironment,
} from "./environment";

describe("Environment Utility", () => {
  beforeEach(() => {
    vi.stubEnv("APP_ENV", "");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "");
    vi.stubEnv("NODE_ENV", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  });

  it("should detect test environment via APP_ENV", () => {
    vi.stubEnv("APP_ENV", "test");
    expect(getEnvironment()).toBe("test");
    expect(isTestEnvironment()).toBe(true);
  });

  it("should detect production environment via APP_ENV", () => {
    vi.stubEnv("APP_ENV", "production");
    expect(getEnvironment()).toBe("production");
  });

  it("should detect environment via Supabase URL project ref", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      "https://kiycimlsatwfqxtfprlr.supabase.co",
    );
    expect(getEnvironment()).toBe("test");
    expect(getSupabaseProjectRef()).toBe("kiycimlsatwfqxtfprlr");
  });

  it("should detect fallback production project ref", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      "https://hpnewqkvpnthpohvxcmq.supabase.co",
    );
    expect(getEnvironment()).toBe("production");
  });

  it("should default to development", () => {
    expect(getEnvironment()).toBe("development");
  });

  it("should assert environment correctly", () => {
    vi.stubEnv("APP_ENV", "test");
    expect(() => assertEnvironment("test")).not.toThrow();
    expect(() => assertEnvironment("production")).toThrow();
  });

  it("should return environment config", () => {
    vi.stubEnv("APP_ENV", "test");
    const config = getEnvironmentConfig();
    expect(config.environment).toBe("test");
    expect(config.isTest).toBe(true);
  });

  it("should log environment without crashing", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logEnvironment("TestContext");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
