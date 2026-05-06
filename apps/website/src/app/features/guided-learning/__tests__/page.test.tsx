import { render, screen, fireEvent } from "@testing-library/react";
import GuidedLearningPage from "../page";
import { useRouter } from "next/navigation";
import {
  useGuidedLearningAuth,
  useGuidedLearningPlans,
  useActivePlan,
  useCompletedPlans,
} from "../hooks";

// Mock the hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("../hooks", () => ({
  useGuidedLearningAuth: jest.fn(),
  useGuidedLearningPlans: jest.fn(),
  useActivePlan: jest.fn(),
  useCompletedPlans: jest.fn(),
}));

// Mock the components to keep tests focused
jest.mock("../components", () => ({
  GuidedLearningHeader: () => <div data-testid="header" />,
  SignInCTABanner: ({ onSignIn }: any) => (
    <button data-testid="signin-banner" onClick={onSignIn}>
      Sign In CTA
    </button>
  ),
  ActivePlanView: ({ plan }: any) => (
    <div data-testid="active-plan">{plan.title}</div>
  ),
  PlanSelectionView: ({ onSelectPlan }: any) => (
    <button
      data-testid="select-plan"
      onClick={() => onSelectPlan({ id: "p1" })}
    >
      Select Plan
    </button>
  ),
}));

describe("GuidedLearningPage", () => {
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = { refresh: jest.fn() };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (useGuidedLearningAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    (useGuidedLearningPlans as jest.Mock).mockReturnValue({
      plans: [],
      isLoading: false,
      error: null,
      questionsRange: "10-20",
      milestoneRange: "2-3",
    });

    (useActivePlan as jest.Mock).mockReturnValue({
      currentPlan: null,
      milestones: [],
      currentMilestoneId: null,
      resumePlan: jest.fn(),
      resetPlan: jest.fn(),
      selectPlan: jest.fn(),
    });

    (useCompletedPlans as jest.Mock).mockReturnValue({
      completedPlans: [],
      planGrades: {},
    });
  });

  it("should render loading state when auth is loading", () => {
    (useGuidedLearningAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    render(<GuidedLearningPage />);
    expect(screen.getByTestId("loading-spinner")).toBeDefined();
  });

  it("should render sign-in banner when not authenticated", () => {
    render(<GuidedLearningPage />);
    expect(screen.getByTestId("signin-banner")).toBeDefined();
  });

  it("should render active plan when authenticated and plan exists", () => {
    (useGuidedLearningAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    (useActivePlan as jest.Mock).mockReturnValue({
      currentPlan: { id: "p1", title: "Active Plan" },
      milestones: [],
      currentMilestoneId: "m1",
      resumePlan: jest.fn(),
      resetPlan: jest.fn(),
      selectPlan: jest.fn(),
    });

    render(<GuidedLearningPage />);
    expect(screen.getByTestId("active-plan")).toBeDefined();
    expect(screen.getByText("Active Plan")).toBeDefined();
  });
});
