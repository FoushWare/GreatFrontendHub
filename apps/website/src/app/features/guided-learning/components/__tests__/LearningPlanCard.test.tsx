import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LearningPlanCard } from "../LearningPlanCard";
import { LearningPlan } from "../../types";

const mockPlan: LearningPlan = {
  id: "test-plan",
  title: "Test Learning Plan",
  subtitle: "A subtitle for testing",
  description: "Test description",
  difficulty: "intermediate",
  duration: { weeks: 4, hoursPerWeek: 5, totalHours: 20 },
  milestones: [
    {
      id: "m1",
      title: "M1",
      description: "D1",
      order: 1,
      topics: [],
      tasks: [],
    },
    {
      id: "m2",
      title: "M2",
      description: "D2",
      order: 2,
      topics: [],
      tasks: [],
    },
  ],
  topics: [],
  features: [],
  outcomes: ["Outcome 1", "Outcome 2", "Outcome 3"],
  color: "from-blue-500 to-purple-500",
  estimatedTotalTime: 20,
};

describe("LearningPlanCard", () => {
  const onSelectMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders plan details correctly", () => {
    render(
      <LearningPlanCard
        plan={mockPlan}
        isCompleted={false}
        onSelect={onSelectMock}
      />,
    );

    expect(screen.getByText("Test Learning Plan")).toBeInTheDocument();
    expect(screen.getByText("A subtitle for testing")).toBeInTheDocument();
    expect(screen.getByText(/intermediate/i)).toBeInTheDocument();
    expect(screen.getByText("2 Milestones")).toBeInTheDocument();
    expect(screen.getByText("20 Hours")).toBeInTheDocument();
    expect(screen.getByText("Outcome 1")).toBeInTheDocument();
    expect(screen.getByText("Outcome 2")).toBeInTheDocument();
    expect(screen.queryByText("Outcome 3")).not.toBeInTheDocument(); // Sliced to 2
  });

  it("shows recommended badge when applicable", () => {
    const recommendedPlan = { ...mockPlan, isRecommended: true };
    render(
      <LearningPlanCard
        plan={recommendedPlan}
        isCompleted={false}
        onSelect={onSelectMock}
      />,
    );
    expect(screen.getByText(/recommended/i)).toBeInTheDocument();
  });

  it("shows completed state and grade", () => {
    render(
      <LearningPlanCard
        plan={mockPlan}
        isCompleted={true}
        grade={95}
        onSelect={onSelectMock}
      />,
    );
    expect(screen.getByText(/Mastered/i)).toBeInTheDocument();
    expect(screen.getByText(/Improve Results/i)).toBeInTheDocument();
  });

  it("calls onSelect when button is clicked", () => {
    render(
      <LearningPlanCard
        plan={mockPlan}
        isCompleted={false}
        onSelect={onSelectMock}
      />,
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(onSelectMock).toHaveBeenCalledWith(mockPlan);
  });
});
