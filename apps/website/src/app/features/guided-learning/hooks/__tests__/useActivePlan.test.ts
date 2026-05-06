import { renderHook, act } from "@testing-library/react";
import { useActivePlan } from "../useActivePlan";
import { useRouter } from "next/navigation";

// Mock useRouter
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("useActivePlan", () => {
  let mockPush: jest.Mock;
  const mockPlan = {
    id: "test-plan",
    title: "Test Plan",
    duration: { weeks: 1, hoursPerWeek: 10, totalHours: 10 },
    difficulty: "beginner",
    milestones: [{ id: "m1", title: "Milestone 1", tasks: [] }],
  };

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("should initialize with null state when no plan is stored", () => {
    const { result } = renderHook(() => useActivePlan(true));
    expect(result.current.currentPlan).toBeNull();
    expect(result.current.milestones).toEqual([]);
    expect(result.current.currentMilestoneId).toBeNull();
  });

  it("should load plan from localStorage on mount", () => {
    localStorage.setItem("active-guided-plan", JSON.stringify(mockPlan));

    const { result } = renderHook(() => useActivePlan(true));

    expect(result.current.currentPlan).toEqual(
      expect.objectContaining({ id: "test-plan" }),
    );
    expect(result.current.milestones).toHaveLength(1);
    expect(result.current.currentMilestoneId).toBe("m1");
  });

  it("should select a plan and update localStorage", () => {
    const { result } = renderHook(() => useActivePlan(true));

    act(() => {
      result.current.selectPlan(mockPlan as any);
    });

    expect(result.current.currentPlan).toEqual(mockPlan);
    expect(localStorage.getItem("active-guided-plan")).toBe(
      JSON.stringify(mockPlan),
    );
    expect(mockPush).toHaveBeenCalledWith("/guided-practice?plan=test-plan");
  });

  it("should reset plan and clear localStorage", () => {
    localStorage.setItem("active-guided-plan", JSON.stringify(mockPlan));
    const { result } = renderHook(() => useActivePlan(true));

    act(() => {
      result.current.resetPlan();
    });

    expect(result.current.currentPlan).toBeNull();
    expect(localStorage.getItem("active-guided-plan")).toBeNull();
  });

  it("should resume plan by navigating to practice page", () => {
    localStorage.setItem("active-guided-plan", JSON.stringify(mockPlan));
    const { result } = renderHook(() => useActivePlan(true));

    act(() => {
      result.current.resumePlan();
    });

    expect(mockPush).toHaveBeenCalledWith("/guided-practice?plan=test-plan");
  });

  it("should return early if not authenticated", () => {
    localStorage.setItem("active-guided-plan", JSON.stringify(mockPlan));
    const { result } = renderHook(() => useActivePlan(false));

    expect(result.current.currentPlan).toBeNull();
  });
});
