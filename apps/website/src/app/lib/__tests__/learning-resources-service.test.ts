import { vi, describe, it, expect, beforeEach } from "vitest";
import { LearningResourcesService } from "../learning-resources-service";

describe("LearningResourcesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the static cache before each test
    (LearningResourcesService as any).cache = { data: null, timestamp: 0 };
    // Mock global fetch
    global.fetch = vi.fn();
  });

  it("should fetch resources from GitHub API and process them", async () => {
    const mockResources = [
      {
        id: 1,
        state: "open",
        title: "Open Issue",
        labels: [],
        user: {},
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: 2,
        state: "closed",
        title: "Closed Issue",
        labels: [],
        user: {},
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
    ];

    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResources,
      } as Response)
      .mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

    const stats = await LearningResourcesService.getResourcesStats();

    // console.log("Stats received:", stats);

    expect(fetchSpy).toHaveBeenCalled();
    expect(stats.total).toBe(2);
    expect(stats.open).toBe(1);
    expect(stats.closed).toBe(1);
    expect(stats.isMockData).toBeFalsy();
  });

  it("should use cache if data is fresh", async () => {
    const mockData = {
      total: 10,
      open: 5,
      closed: 5,
      openResources: [],
      closedResources: [],
    };
    (LearningResourcesService as any).cache = {
      data: mockData,
      timestamp: Date.now(),
    };

    const stats = await LearningResourcesService.getResourcesStats();

    expect(stats).toEqual(mockData);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should fallback to mock data if API fails", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
    });

    const stats = await LearningResourcesService.getResourcesStats();

    expect(stats.isMockData).toBe(true);
    expect(stats.total).toBeGreaterThan(0);
  });

  it("should fallback to mock data if fetch throws", async () => {
    (global.fetch as any).mockRejectedValue(new Error("Network Error"));

    const stats = await LearningResourcesService.getResourcesStats();

    expect(stats.isMockData).toBe(true);
  });

  it("should fetch multiple pages if needed", async () => {
    // Mock first page with 100 items, second page empty
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          new Array(100).fill({ state: "open", labels: [], user: {} }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    const stats = await LearningResourcesService.getResourcesStats();

    expect(stats.total).toBe(100);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
