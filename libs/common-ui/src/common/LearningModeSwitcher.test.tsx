import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LearningModeSwitcher } from "./LearningModeSwitcher";

const setUserType = vi.fn();

vi.mock("@elzatona/contexts", () => ({
  useUserType: () => ({
    userType: "guided",
    setUserType,
  }),
}));

describe("LearningModeSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates the learning mode and navigates to guided learning", () => {
    const onGuidedSelect = vi.fn();
    const onFreeStyleSelect = vi.fn();

    render(
      <LearningModeSwitcher
        onGuidedSelect={onGuidedSelect}
        onFreeStyleSelect={onFreeStyleSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /guided/i }));

    expect(setUserType).toHaveBeenCalledWith("guided");
    expect(onGuidedSelect).toHaveBeenCalledTimes(1);
    expect(onFreeStyleSelect).not.toHaveBeenCalled();
  });

  it("updates the learning mode and navigates to free style practice", () => {
    const onGuidedSelect = vi.fn();
    const onFreeStyleSelect = vi.fn();

    render(
      <LearningModeSwitcher
        onGuidedSelect={onGuidedSelect}
        onFreeStyleSelect={onFreeStyleSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /free style/i }));

    expect(setUserType).toHaveBeenCalledWith("self-directed");
    expect(onFreeStyleSelect).toHaveBeenCalledTimes(1);
    expect(onGuidedSelect).not.toHaveBeenCalled();
  });
});
