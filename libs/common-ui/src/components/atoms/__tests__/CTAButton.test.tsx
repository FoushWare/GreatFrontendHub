import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CTAButton } from "../CTAButton";

// Mock lucide-react
vi.mock("lucide-react", () => ({
  ArrowRight: () => <div data-testid="arrow-right" />,
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock utilities
vi.mock("@elzatona/utilities/client", () => ({
  getColorClasses: vi.fn((color) => `from-${color}-500 to-${color}-600`),
}));

describe("CTAButton", () => {
  it("renders correctly with text and link", () => {
    render(<CTAButton href="/test" text="Click Me" color="blue" />);

    const link = screen.getByRole("link", { name: /click me/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("renders with custom icon", () => {
    render(
      <CTAButton
        href="/test"
        text="Icon Test"
        color="green"
        icon={<span data-testid="custom-icon">🔥</span>}
      />,
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("applies variant classes correctly", () => {
    const { rerender } = render(
      <CTAButton href="/test" text="Gradient" color="red" variant="gradient" />,
    );
    let link = screen.getByRole("link");
    expect(link.className).toContain("from-red-500");

    rerender(
      <CTAButton href="/test" text="Solid" color="red" variant="solid" />,
    );
    link = screen.getByRole("link");
    expect(link.className).toContain("bg-red-600");
  });

  it("handles showAnimation prop", () => {
    const { container: containerAnim } = render(
      <CTAButton href="/test" text="Anim" color="blue" showAnimation={true} />,
    );
    expect(containerAnim.firstChild).toHaveClass("opacity-100");

    const { container: containerNoAnim } = render(
      <CTAButton
        href="/test"
        text="No Anim"
        color="blue"
        showAnimation={false}
      />,
    );
    expect(containerNoAnim.firstChild).toHaveClass("opacity-100");
  });
});
