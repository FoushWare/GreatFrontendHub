import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActivePlanView } from "../ActivePlanView";
import { LearningPlan } from "../../types";
import { StudyMilestone } from "@elzatona/types";

const mockPlan: LearningPlan = {
  id: "test-plan",
  title: "Test Active Plan",
  subtitle: "A subtitle",
  description: "Description",
  difficulty: "advanced",
  duration: { weeks: 1, hoursPerWeek: 14, totalHours: 14 },
  milestones: [],
  topics: [
    { id: "t1", title: "T1", description: "D1" },
    { id: "t2", title: "T2", description: "D2" },
  ],
  features: [],
  outcomes: [],
  color: "from-blue-500 to-purple-500",
  estimatedTotalTime: 14,
};

const mockMilestones: StudyMilestone[] = [
  {
    id: "m1",
    title: "M1",
    description: "D1",
    order: 1,
    topics: [],
    tasks: [],
    progress: 100,
  },
  {
    id: "m2",
    title: "M2",
    description: "D2",
    order: 2,
    topics: [],
    tasks: [],
    progress: 50,
  },
  {
    id: "m3",
    title: "M3",
    description: "D3",
    order: 3,
    topics: [],
    tasks: [],
    progress: 0,
  },
];

describe("ActivePlanView", () => {
  const onResumeMock = jest.fn();
  const onResetMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with progress stats", () => {
    render(
      <ActivePlanView
        plan={mockPlan}
        milestones={mockMilestones}
        currentMilestoneId="m2"
        onResume={onResumeMock}
        onReset={onResetMock}
      />,
    );

    expect(screen.getByText("Test Active Plan")).toBeInTheDocument();
    expect(screen.getByText("33%")).toBeInTheDocument(); // 1/3 completed
    expect(screen.getByText("2/3")).toBeInTheDocument(); // Current is index 2 of 3
    expect(screen.getByText("1")).toBeInTheDocument(); // Completed count
    expect(screen.getByText("2")).toBeInTheDocument(); // Topics count
  });

  it("calls onResume when Continue button is clicked", () => {
    render(
      <ActivePlanView
        plan={mockPlan}
        milestones={mockMilestones}
        currentMilestoneId="m2"
        onResume={onResumeMock}
        onReset={onResetMock}
      />,
    );
    const continueButton = screen.getByText(/continue to practice/i);
    fireEvent.click(continueButton);
    expect(onResumeMock).toHaveBeenCalled();
  });

  it("calls onReset when Reset button is clicked", () => {
    render(
      <ActivePlanView
        plan={mockPlan}
        milestones={mockMilestones}
        currentMilestoneId="m2"
        onResume={onResumeMock}
        onReset={onResetMock}
      />,
    );
    const resetButton = screen.getByText(/reset plan/i);
    fireEvent.click(resetButton);
    expect(onResetMock).toHaveBeenCalled();
  });

  it("handles zero milestones gracefully", () => {
    render(
      <ActivePlanView
        plan={mockPlan}
        milestones={[]}
        currentMilestoneId={null}
        onResume={onResumeMock}
        onReset={onResetMock}
      />,
    );
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("1/0")).toBeInTheDocument(); // index fallback to 0 + 1 / total 0
  });
});
