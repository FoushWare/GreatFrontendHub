import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  syncAllGuidedProgress,
  syncFreeStyleProgress,
  syncAllProgressOnLogin,
} from "../sync-progress-on-login";

describe("sync-progress-on-login", () => {
  const authToken = "test-token";
  const userId = "test-user-id";

  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      length: 0,
      key: vi.fn(),
    });
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("syncAllGuidedProgress", () => {
    it("should return success when no keys are found", async () => {
      const result = await syncAllGuidedProgress(authToken, userId);
      expect(result.success).toBe(true);
      expect(result.synced).toBe(0);
    });

    it("should sync found keys and remove them from localStorage", async () => {
      const mockKey = "guided-practice-progress-plan1";
      const mockData = JSON.stringify({
        completedQuestions: ["q1"],
        currentPosition: {
          cardIndex: 0,
          categoryIndex: 0,
          topicIndex: 0,
          questionIndex: 0,
        },
        lastUpdated: "2024-01-01",
      });

      const mockStorage: any = {
        length: 1,
        key: vi.fn().mockReturnValue(mockKey),
        getItem: vi.fn().mockReturnValue(mockData),
        removeItem: vi.fn(),
        startsWith: vi.fn(),
      };
      vi.stubGlobal("localStorage", mockStorage);

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await syncAllGuidedProgress(authToken, userId);

      expect(result.success).toBe(true);
      expect(result.synced).toBe(1);
      expect(fetch).toHaveBeenCalledWith(
        "/api/progress/guided-learning/sync",
        expect.any(Object),
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith(mockKey);
    });
  });

  describe("syncFreeStyleProgress", () => {
    it("should sync free-style progress if exists", async () => {
      const mockData = JSON.stringify({
        lastQuestionIndex: 5,
        answeredQuestions: ["q1", "q2"],
        lastUpdated: Date.now(),
      });

      vi.mocked(localStorage.getItem).mockReturnValue(mockData);
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await syncFreeStyleProgress(authToken, userId);

      expect(result.success).toBe(true);
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        "free-style-practice-progress",
      );
    });

    it("should handle sync failure", async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(
        JSON.stringify({ lastQuestionIndex: 1 }),
      );
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Server Error" }),
      } as Response);

      const result = await syncFreeStyleProgress(authToken, userId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Server Error");
    });
  });

  describe("syncAllProgressOnLogin", () => {
    it("should call both sync functions", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await syncAllProgressOnLogin(authToken, userId);

      expect(result.success).toBe(true);
      expect(result.guided).toBeDefined();
      expect(result.freeStyle).toBeDefined();
    });
  });
});
