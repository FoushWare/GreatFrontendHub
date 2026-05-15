import React from "react";
import { render, screen } from "@testing-library/react";
import { GuidedTour } from "./GuidedTour";
import { vi, describe, it, expect } from "vitest";

// Mock @reactour/tour
vi.mock("@reactour/tour", () => {
  return {
    TourProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="tour-provider">{children}</div>
    ),
    useTour: () => ({
      setIsOpen: vi.fn(),
      isOpen: false,
    }),
  };
});

// Mock supabase client
vi.mock("@supabase/supabase-js", () => {
  return {
    createClient: vi.fn().mockReturnValue({}),
  };
});

describe("GuidedTour", () => {
  it("renders without crashing", () => {
    render(
      <GuidedTour isOpen={true} onComplete={() => {}} onSkip={() => {}} />,
    );
    expect(screen.getByTestId("tour-provider")).toBeInTheDocument();
  });
});
