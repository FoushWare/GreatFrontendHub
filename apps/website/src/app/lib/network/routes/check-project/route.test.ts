import { vi, describe, it, expect, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------

vi.mock("../../../api-config", () => ({
  getSupabaseConfig: vi.fn(() => ({
    url: "https://hpnewqkvpnthpohvxcmq.supabase.co",
    serviceRoleKey:
      "header.eyJyZWYiOiJocG5ld3FrdnBudGhwb2h2eGNtcSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUifQ.signature",
  })),
  getApiConfig: vi.fn(() => ({})),
}));

vi.mock("../../../environment", () => ({
  getEnvironment: vi.fn(() => "production"),
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

describe("Check Project API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  it("should return 401 if no token is provided", async () => {
    const request = new NextRequest("https://example.com/api/check-project");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Admin token required");
  });

  it("should return project status for valid admin token", async () => {
    (jwt.verify as any).mockReturnValue({ adminId: "admin-1" });

    const request = new NextRequest("https://example.com/api/check-project", {
      headers: {
        authorization: "Bearer valid-token",
      },
    });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.supabase.urlProjectRef).toBe("hpnewqkvpnthpohvxcmq");
    expect(data.supabase.match).toBe(true);
    expect(data.status.isProductionProject).toBe(true);
  });

  it("should handle configuration mismatch", async () => {
    (jwt.verify as any).mockReturnValue({ id: "admin-2" });

    const { getSupabaseConfig } = await import("../../../api-config");
    (getSupabaseConfig as any).mockReturnValue({
      url: "https://kiycimlsatwfqxtfprlr.supabase.co",
      serviceRoleKey:
        "header.eyJyZWYiOiJocG5ld3FrdnBudGhwb2h2eGNtcSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUifQ.signature",
    });

    const request = new NextRequest("https://example.com/api/check-project", {
      headers: {
        authorization: "Bearer valid-token",
      },
    });
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.supabase.match).toBe(false);
    expect(data.message).toBe("❌ Configuration mismatch");
  });

  it("should return 401 for invalid tokens", async () => {
    (jwt.verify as any).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const request = new NextRequest("https://example.com/api/check-project", {
      headers: {
        authorization: "Bearer invalid-token",
      },
    });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain("Invalid or expired token");
  });

  it("should handle unexpected errors with 500", async () => {
    (jwt.verify as any).mockReturnValue({ adminId: "admin-1" });

    const { getSupabaseConfig } = await import("../../../api-config");
    (getSupabaseConfig as any).mockImplementation(() => {
      throw new Error("Unexpected error");
    });

    const request = new NextRequest("https://example.com/api/check-project", {
      headers: {
        authorization: "Bearer valid-token",
      },
    });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Unexpected error");
  });
});
