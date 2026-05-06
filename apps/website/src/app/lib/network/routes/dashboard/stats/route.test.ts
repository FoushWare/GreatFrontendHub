import { vi, describe, it, expect, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------

const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
};

vi.mock("../../../../get-supabase-client", () => ({
  getSupabaseClient: vi.fn(() => mockSupabase),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
  }),
}));

vi.mock("../../../../server-auth", () => ({
  verifySupabaseToken: vi.fn(),
  getUserFromRequest: vi.fn(),
}));

vi.mock("@elzatona/utilities", () => ({
  calculateStreak: vi.fn(() => ({ current: 5, longest: 10 })),
  calculateAchievements: vi.fn(() => []),
}));

describe("Dashboard Stats API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return mock data if no user is authenticated", async () => {
    const { getUserFromRequest } = await import("../../../../server-auth");
    (getUserFromRequest as any).mockResolvedValue(null);

    const request = new NextRequest("https://example.com/api/dashboard/stats");
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.stats.questionsCompleted).toBe(0);
    expect(data.warning).toBeDefined();
  });

  it("should return aggregated stats for an authenticated user", async () => {
    const { getUserFromRequest } = await import("../../../../server-auth");
    (getUserFromRequest as any).mockResolvedValue({ id: "user-123" });

    // Mock Supabase data
    const mockAttempts = [
      {
        question_id: "q1",
        is_correct: true,
        points_earned: 10,
        created_at: "2024-01-01",
      },
      {
        question_id: "q2",
        is_correct: false,
        points_earned: 0,
        created_at: "2024-01-02",
      },
    ];
    const mockProgress = [
      {
        id: "p1",
        progress_data: JSON.stringify({
          completedQuestions: ["q3"],
          correctAnswers: ["q3"],
        }),
        updated_at: "2024-01-03",
      },
    ];

    // Setup Supabase chain mock
    mockSupabase.from.mockImplementation((table) => {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: table === "question_attempts" ? mockAttempts : mockProgress,
          error: null,
        }),
      };
    });

    const request = new NextRequest("https://example.com/api/dashboard/stats");
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.stats.questionsCompleted).toBe(3); // q1, q2, q3
    expect(data.stats.totalPoints).toBe(20); // 10 from attempt + 10 (1*10) from progress
    expect(data.stats.dayStreak).toBe(5);
  });

  it("should handle database errors gracefully", async () => {
    const { getUserFromRequest } = await import("../../../../server-auth");
    (getUserFromRequest as any).mockResolvedValue({ id: "user-123" });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: "DB Error" } }),
    });

    const request = new NextRequest("https://example.com/api/dashboard/stats");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to fetch dashboard stats");
  });

  it("should resolve user ID from cookies if header auth fails", async () => {
    const { getUserFromRequest, verifySupabaseToken } =
      await import("../../../../server-auth");
    const { cookies } = await import("next/headers");

    (getUserFromRequest as any).mockResolvedValue(null);
    const mockCookieGet = vi.fn().mockReturnValue({ value: "valid-token" });
    (cookies as any).mockResolvedValue({ get: mockCookieGet });
    (verifySupabaseToken as any).mockResolvedValue({ id: "user-456" });

    // Mock empty data
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const request = new NextRequest("https://example.com/api/dashboard/stats");
    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(mockCookieGet).toHaveBeenCalledWith("firebase_token");
    expect(verifySupabaseToken).toHaveBeenCalledWith("valid-token");
  });
});
