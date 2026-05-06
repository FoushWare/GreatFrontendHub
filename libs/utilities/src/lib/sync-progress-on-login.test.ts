import {
  syncAllProgressOnLogin,
  syncAllGuidedProgress,
  syncFreeStyleProgress,
} from "./sync-progress-on-login";

describe("Sync Progress On Login", () => {
  let mockFetch: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Mock localStorage
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        for (const key in store) delete store[key];
      }),
      key: vi.fn((index: number) => Object.keys(store)[index] || null),
      get length() {
        return Object.keys(store).length;
      },
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("syncFreeStyleProgress", () => {
    it("should return true if no free-style progress is found", async () => {
      const result = await syncFreeStyleProgress("token");
      expect(result.success).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should successfully sync free-style progress and remove from localStorage", async () => {
      localStorage.setItem(
        "free-style-practice-progress",
        JSON.stringify({
          lastQuestionIndex: 1,
        }),
      );
      mockFetch.mockResolvedValueOnce({ ok: true });

      const result = await syncFreeStyleProgress("token", "user123");

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/progress/free-style/sync",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer token",
          },
        }),
      );
      expect(localStorage.getItem("free-style-practice-progress")).toBeNull();
    });

    it("should return false if sync fails with error from server", async () => {
      localStorage.setItem("free-style-practice-progress", JSON.stringify({}));
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: "Server Error" }),
      });

      const result = await syncFreeStyleProgress("token");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Server Error");
    });

    it("should return false on unexpected error", async () => {
      localStorage.setItem("free-style-practice-progress", "invalid-json");

      const result = await syncFreeStyleProgress("token");

      expect(result.success).toBe(false);
    });
  });

  describe("syncAllGuidedProgress", () => {
    it("should successfully sync guided progress plans", async () => {
      localStorage.setItem(
        "guided-practice-progress-plan1",
        JSON.stringify({}),
      );
      localStorage.setItem(
        "guided-practice-progress-plan2",
        JSON.stringify({}),
      );
      mockFetch.mockResolvedValue({ ok: true });

      const result = await syncAllGuidedProgress("token");

      expect(result.success).toBe(true);
      expect(result.synced).toBe(2);
      expect(result.errors).toEqual([]);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(localStorage.getItem("guided-practice-progress-plan1")).toBeNull();
    });

    it("should return false and list errors if any plan fails", async () => {
      localStorage.setItem(
        "guided-practice-progress-plan1",
        JSON.stringify({}),
      );
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: "Failed" }),
      });

      const result = await syncAllGuidedProgress("token");

      expect(result.success).toBe(false);
      expect(result.synced).toBe(0);
      expect(result.errors).toEqual(["Plan plan1: Failed"]);
    });

    it("should handle invalid json gracefully", async () => {
      localStorage.setItem("guided-practice-progress-plan1", "invalid");
      const result = await syncAllGuidedProgress("token");

      expect(result.success).toBe(false);
      expect(result.errors.length).toBe(1);
    });
  });

  describe("syncAllProgressOnLogin", () => {
    it("should combine results from guided and free-style", async () => {
      localStorage.setItem(
        "guided-practice-progress-plan1",
        JSON.stringify({}),
      );
      localStorage.setItem("free-style-practice-progress", JSON.stringify({}));
      mockFetch.mockResolvedValue({ ok: true });

      const result = await syncAllProgressOnLogin("token");

      expect(result.success).toBe(true);
      expect(result.guided.synced).toBe(1);
      expect(result.freeStyle.success).toBe(true);
    });
  });
});
