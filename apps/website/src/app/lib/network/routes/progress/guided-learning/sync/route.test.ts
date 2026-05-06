import { POST } from "./route";
import { NextRequest } from "next/server";
import { verifySupabaseToken } from "../../../../../server-auth";
import { getSupabaseClient } from "../../../../../get-supabase-client";

// Mock dependencies
vi.mock("../../../../../server-auth", () => ({
  verifySupabaseToken: vi.fn(),
}));

vi.mock("../../../../../get-supabase-client", () => ({
  getSupabaseClient: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: "fake-token" }),
  }),
}));

describe("Guided Learning Sync Route", () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    upsert: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSupabaseClient).mockReturnValue(mockSupabase as any);
  });

  const validBody = {
    planId: "plan-123",
    completedQuestions: [],
    completedTopics: [],
    completedCategories: [],
    completedCards: [],
    currentPosition: {},
    lastUpdated: new Date().toISOString(),
  };

  it("should return dev mode response if user not found via token or data", async () => {
    vi.mocked(verifySupabaseToken).mockResolvedValueOnce(null);
    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: "Not found" },
    });

    const request = new NextRequest("http://localhost/api/sync", {
      method: "POST",
      body: JSON.stringify({ ...validBody, userId: "user-456" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.warning).toBe("Using development mode");
    expect(data.message).toContain("token invalid");
  });

  it("should resolve user from data if token fails and sync to database", async () => {
    vi.mocked(verifySupabaseToken).mockResolvedValueOnce(null);
    mockSupabase.single.mockResolvedValueOnce({
      data: {
        id: "user-456",
        email: "test@test.com",
        role: "user",
        name: "Test",
      },
      error: null,
    });
    mockSupabase.upsert.mockResolvedValueOnce({ error: null });

    const request = new NextRequest("http://localhost/api/sync", {
      method: "POST",
      body: JSON.stringify({ ...validBody, userId: "user-456" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(mockSupabase.upsert).toHaveBeenCalled();
  });

  it("should sync to database if user is verified via token", async () => {
    vi.mocked(verifySupabaseToken).mockResolvedValueOnce({
      id: "user-123",
      email: "",
      role: "",
      name: "",
    });
    mockSupabase.upsert.mockResolvedValueOnce({ error: null });

    const request = new NextRequest("http://localhost/api/sync", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(mockSupabase.upsert).toHaveBeenCalled();
  });

  it("should return server error if database sync fails", async () => {
    vi.mocked(verifySupabaseToken).mockResolvedValueOnce({
      id: "user-123",
      email: "",
      role: "",
      name: "",
    });
    mockSupabase.upsert.mockResolvedValueOnce({
      error: new Error("DB failure"),
    });

    const request = new NextRequest("http://localhost/api/sync", {
      method: "POST",
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const data = await response.json();

    // The catch block uses _devModeResponse("server error")
    expect(data.success).toBe(true);
    expect(data.message).toContain("server error");
  });
});
