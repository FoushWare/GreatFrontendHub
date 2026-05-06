import { renderHook, waitFor } from "@testing-library/react";
import { useGuidedLearningPlans } from "../useGuidedLearningPlans";

// Mock global fetch
global.fetch = jest.fn();

describe("useGuidedLearningPlans", () => {
  const mockPlans = [
    {
      id: "plan-1",
      difficulty: "beginner",
      totalQuestions: 10,
      milestones: [1, 2],
    },
    {
      id: "plan-2",
      difficulty: "advanced",
      totalQuestions: 20,
      milestones: [1, 2, 3],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch and load plans successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockPlans }),
    });

    const { result } = renderHook(() => useGuidedLearningPlans());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.allPlans).toHaveLength(2);
    expect(result.current.plans[0].id).toBe("plan-1"); // beginner first
    expect(result.current.questionsRange).toBe("10-20");
    expect(result.current.milestoneRange).toBe("2-3");
    expect(result.current.error).toBeNull();
  });

  it("should handle fetch error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useGuidedLearningPlans());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.allPlans).toHaveLength(0);
    expect(result.current.error).toContain("500");
  });

  it("should handle exception during fetch", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network Error"),
    );

    const { result } = renderHook(() => useGuidedLearningPlans());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.allPlans).toHaveLength(0);
    expect(result.current.error).toBe("Network Error");
  });

  it("should handle legacy array response", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlans,
    });

    const { result } = renderHook(() => useGuidedLearningPlans());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.allPlans).toHaveLength(2);
  });
});
