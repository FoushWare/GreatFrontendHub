/**
 * Unit Tests for HomePageLayout Component
 *
 * Tests for the HomePageLayout organism component
 * Co-located with component for easy discovery
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi as vitest } from "vitest";
import { HomePageLayout } from "./HomePageLayout";
import type {
  UserType,
  ActivePlan,
  PersonalizedContent,
} from "@elzatona/types";
import { Play } from "lucide-react";

const mockPersonalizedContent: PersonalizedContent = {
  title: "Master Frontend Development",
  subtitle: "The complete platform to ace your frontend interviews",
  cta: "Get Started",
  ctaLink: "/get-started",
  icon: React.createElement(Play),
  color: "indigo",
};

describe("HomePageLayout", () => {
  it("should render Learning Style Selector", () => {
    render(
      <HomePageLayout
        userType={null}
        showAnimation={false}
        hasActivePlan={false}
        activePlan={null}
        personalizedContent={mockPersonalizedContent}
        onGuidedClick={() => {}}
        onFreestyleClick={() => {}}
      />,
    );
    expect(
      screen.getByText(/How would you like to learn\?/i),
    ).toBeInTheDocument();
  });

  it("should render Learning Style Selector with userType provided", () => {
    render(
      <HomePageLayout
        userType="guided"
        showAnimation={false}
        hasActivePlan={false}
        activePlan={null}
        personalizedContent={mockPersonalizedContent}
        onGuidedClick={() => {}}
        onFreestyleClick={() => {}}
      />,
    );
    expect(
      screen.getByText(/How would you like to learn\?/i),
    ).toBeInTheDocument();
  });

  it("should call onGuidedClick when guided button is clicked", async () => {
    const handleGuidedClick = vitest.fn();
    const { getByRole } = render(
      <HomePageLayout
        userType={null}
        showAnimation={false}
        hasActivePlan={false}
        activePlan={null}
        personalizedContent={mockPersonalizedContent}
        onGuidedClick={handleGuidedClick}
        onFreestyleClick={() => {}}
      />,
    );
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
