import { describe, it, expect, vi, beforeEach } from "vitest";
import { getApiConfig, getSupabaseConfig, getFetchConfig } from "../api-config";
import * as environment from "../environment";

vi.mock("../environment", () => ({
  getEnvironment: vi.fn(),
  isTestEnvironment: vi.fn(),
  isProductionEnvironment: vi.fn(),
  isDevelopmentEnvironment: vi.fn(),
}));

describe("api-config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
  });

  describe("getApiConfig", () => {
    it("should return configuration for development environment", () => {
      vi.mocked(environment.getEnvironment).mockReturnValue("development");
      vi.mocked(environment.isDevelopmentEnvironment).mockReturnValue(true);
      vi.mocked(environment.isTestEnvironment).mockReturnValue(false);
      vi.mocked(environment.isProductionEnvironment).mockReturnValue(false);

      process.env["NEXT_PUBLIC_SUPABASE_URL"] = "https://dev.supabase.co";
      process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = "dev-anon";
      process.env["ADMIN_EMAIL"] = "dev@example.com";

      const config = getApiConfig();

      expect(config.environment).toBe("development");
      expect(config.supabaseUrl).toBe("https://dev.supabase.co");
      expect(config.adminEmail).toBe("dev@example.com");
      expect(config.isDevelopment).toBe(true);
    });

    it("should return configuration for production environment", () => {
      vi.mocked(environment.getEnvironment).mockReturnValue("production");
      vi.mocked(environment.isProductionEnvironment).mockReturnValue(true);
      vi.mocked(environment.isTestEnvironment).mockReturnValue(false);
      vi.mocked(environment.isDevelopmentEnvironment).mockReturnValue(false);

      process.env["NEXT_PUBLIC_SUPABASE_URL"] = "https://prod.supabase.co";
      process.env["INITIAL_ADMIN_EMAIL"] = "prod@example.com";

      const config = getApiConfig();

      expect(config.environment).toBe("production");
      expect(config.isProduction).toBe(true);
      expect(config.adminEmail).toBe("prod@example.com");
      expect(config.enableCaching).toBe(true);
    });

    it("should warn if APP_ENV=test but using production URL", () => {
      vi.mocked(environment.isTestEnvironment).mockReturnValue(true);
      process.env["NEXT_PUBLIC_SUPABASE_URL"] =
        "https://hpnewqkvpnthpohvxcmq.supabase.co";

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      getApiConfig();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "WARNING: APP_ENV=test but using PRODUCTION project!",
        ),
      );
    });
  });

  describe("getSupabaseConfig", () => {
    it("should throw error if config is missing", () => {
      process.env["NEXT_PUBLIC_SUPABASE_URL"] = "";
      expect(() => getSupabaseConfig()).toThrow();
    });

    it("should return supabase configuration if present", () => {
      process.env["NEXT_PUBLIC_SUPABASE_URL"] = "https://test.supabase.co";
      process.env["SUPABASE_SERVICE_ROLE_KEY"] = "test-key";

      const config = getSupabaseConfig();
      expect(config.url).toBe("https://test.supabase.co");
      expect(config.serviceRoleKey).toBe("test-key");
    });
  });

  describe("getFetchConfig", () => {
    it("should merge headers", () => {
      const config = getFetchConfig({ "X-Custom": "test" });
      expect(config.headers).toHaveProperty("X-Custom", "test");
      expect(config.headers).toHaveProperty("Content-Type", "application/json");
    });
  });
});
