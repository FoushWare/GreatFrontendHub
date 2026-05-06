import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LearningModeSwitcher } from "../LearningModeSwitcher";
import { useUserType } from "@elzatona/contexts";

// Mock the context hook
jest.mock("@elzatona/contexts", () => ({
  useUserType: jest.fn(),
}));

describe("LearningModeSwitcher", () => {
  const setUserTypeMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUserType as jest.Mock).mockReturnValue({
      userType: "guided",
      setUserType: setUserTypeMock,
    });
  });

  it("renders correctly in guided mode", () => {
    render(<LearningModeSwitcher />);

    const guidedButton = screen.getByRole("button", { name: /guided/i });
    const freeStyleButton = screen.getByRole("button", { name: /free style/i });

    expect(guidedButton).toHaveAttribute("aria-pressed", "true");
    expect(freeStyleButton).toHaveAttribute("aria-pressed", "false");
  });

  it("renders correctly in free style mode", () => {
    (useUserType as jest.Mock).mockReturnValue({
      userType: "self-directed",
      setUserType: setUserTypeMock,
    });

    render(<LearningModeSwitcher />);

    const guidedButton = screen.getByRole("button", { name: /guided/i });
    const freeStyleButton = screen.getByRole("button", { name: /free style/i });

    expect(guidedButton).toHaveAttribute("aria-pressed", "false");
    expect(freeStyleButton).toHaveAttribute("aria-pressed", "true");
  });

  it("calls setUserType when buttons are clicked", () => {
    render(<LearningModeSwitcher />);

    const freeStyleButton = screen.getByRole("button", { name: /free style/i });
    fireEvent.click(freeStyleButton);

    expect(setUserTypeMock).toHaveBeenCalledWith("self-directed");

    const guidedButton = screen.getByRole("button", { name: /guided/i });
    fireEvent.click(guidedButton);

    expect(setUserTypeMock).toHaveBeenCalledWith("guided");
  });

  it("applies scrolled styles when isScrolled is true", () => {
    render(<LearningModeSwitcher isScrolled={true} />);
    const container = screen.getByLabelText(/learning mode selection/i);

    expect(container.className).toContain("bg-gray-100/80");
    expect(container.className).toContain("backdrop-blur-md");
  });

  it("applies transparent styles when isScrolled is false", () => {
    render(<LearningModeSwitcher isScrolled={false} />);
    const container = screen.getByLabelText(/learning mode selection/i);

    expect(container.className).toContain("bg-white/10");
  });
});
