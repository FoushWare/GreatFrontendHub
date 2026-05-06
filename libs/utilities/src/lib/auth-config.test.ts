import { describe, it, expect } from "vitest";
import { authOptions, authorizeCredentials } from "./auth-config";

describe("authOptions", () => {
  describe("authorizeCredentials", () => {
    it("should return null if credentials are missing", async () => {
      const result = await authorizeCredentials(null);
      expect(result).toBeNull();
    });

    it("should return null if email or password missing", async () => {
      expect(await authorizeCredentials({ email: "test@test.com" })).toBeNull();
      expect(await authorizeCredentials({ password: "pass" })).toBeNull();
    });

    it("should return developer user for valid dev credentials", async () => {
      const result = await authorizeCredentials({
        email: "DEV@ELZATONA.COM",
        password: "dev-access",
      });
      expect(result).not.toBeNull();
      expect(result?.id).toBe("dev-user-id");
      expect(result?.role).toBe("developer");
    });

    it("should return admin user for valid admin credentials", async () => {
      const result = await authorizeCredentials({
        email: "admin@test.com",
        password: "admin-pass",
      });
      expect(result).not.toBeNull();
      expect(result?.role).toBe("admin");
    });

    it("should return guest user for valid guest credentials", async () => {
      const result = await authorizeCredentials({
        email: "guest@test.com",
        password: "guest-pass",
      });
      expect(result).not.toBeNull();
      expect(result?.role).toBe("guest");
    });

    it("should return null for invalid credentials", async () => {
      const result = await authorizeCredentials({
        email: "wrong@test.com",
        password: "wrong",
      });
      expect(result).toBeNull();
    });
  });

  describe("callbacks", () => {
    it("jwt callback should append user and account info", async () => {
      const jwt = authOptions.callbacks?.jwt as any;
      const token = { existing: "value" };
      const user = { id: "user-123" };
      const account = { provider: "google" };

      const result = await jwt({ token, user, account });
      expect(result.id).toBe("user-123");
      expect(result.provider).toBe("google");
      expect(result.existing).toBe("value");
    });

    it("session callback should append token info to session user", async () => {
      const sessionCb = authOptions.callbacks?.session as any;
      const session = { user: { name: "Test" } };
      const token = { id: "user-123", provider: "github" };

      const result = await sessionCb({ session, token });
      expect(result.user.id).toBe("user-123");
      expect(result.user.provider).toBe("github");
    });
  });
});
