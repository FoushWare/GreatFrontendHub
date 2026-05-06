import { describe, it, expect, vi, beforeEach } from "vitest";
import { getApiConfig, getSupabaseConfig } from "./api-config";

describe("API Config Utility", () => {
  beforeEach(() => {
    vi.stubEnv("APP_ENV", "test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key");
  });

  it("should return correct config for test environment", () => {
    const config = getApiConfig();
    expect(config.environment).toBe("test");
    expect(config.supabaseUrl).toBe("https://test.supabase.co");
    expect(config.headers["X-Test-Mode"]).toBe("true");
  });

  it("should throw error if Supabase config is missing", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(() => getSupabaseConfig()).toThrow();
  });

  it("should return Supabase config correctly", () => {
    const config = getSupabaseConfig();
    expect(config.url).toBe("https://test.supabase.co");
    expect(config.serviceRoleKey).toBe("service-key");
  });
});
