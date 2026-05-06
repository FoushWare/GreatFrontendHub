import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UserStatistics } from "../UserStatistics";

// Mock lucide-react
vi.mock("lucide-react", () => ({
  Users: () => <div data-testid="icon-users" />,
  TrendingUp: () => <div data-testid="icon-trending" />,
  Award: () => <div data-testid="icon-award" />,
  Clock: () => <div data-testid="icon-clock" />,
}));

describe("UserStatistics", () => {
  it("renders hardcoded statistics correctly", () => {
    render(<UserStatistics />);

    expect(screen.getByText("49.5K+")).toBeInTheDocument();
    expect(screen.getByText("86%")).toBeInTheDocument();
    expect(screen.getByText("2226.3K+")).toBeInTheDocument();
    expect(screen.getByText("32m")).toBeInTheDocument();

    expect(screen.getByText("Active Learners")).toBeInTheDocument();
    expect(screen.getByText("Success Rate")).toBeInTheDocument();
    expect(screen.getByText("Questions Solved")).toBeInTheDocument();
    expect(screen.getByText("Avg. Study Time")).toBeInTheDocument();
  });

  it("renders all icons", () => {
    render(<UserStatistics />);

    // We mocked these icons to return div with data-testid
    expect(screen.getByTestId("icon-users")).toBeInTheDocument();
    expect(screen.getByTestId("icon-trending")).toBeInTheDocument();
    expect(screen.getByTestId("icon-award")).toBeInTheDocument();
    expect(screen.getByTestId("icon-clock")).toBeInTheDocument();
  });
});
