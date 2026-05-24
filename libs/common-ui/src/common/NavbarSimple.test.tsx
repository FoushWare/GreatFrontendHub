import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NavbarSimple } from "./NavbarSimple";

const push = vi.fn();
const setUserType = vi.fn();
const setIsMobileMenuOpen = vi.fn();
const logout = vi.fn();
const toggleDarkMode = vi.fn();

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push }),
}));

vi.mock("@elzatona/contexts", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    logout,
  }),
  useTheme: () => ({
    isDarkMode: false,
    toggleDarkMode,
  }),
  useUserType: () => ({
    userType: "guided",
    setUserType,
  }),
  useMobileMenu: () => ({
    setIsMobileMenuOpen,
  }),
}));

vi.mock("./AlzatonaLogo", () => ({
  AlzatonaLogo: ({ showText }: { showText?: boolean }) => (
    <div data-testid="logo" data-show-text={showText ? "true" : "false"}>
      Logo
    </div>
  ),
}));

vi.mock("./LearningModeSwitcher", () => ({
  LearningModeSwitcher: ({
    onGuidedSelect,
    onFreeStyleSelect,
  }: {
    onGuidedSelect?: () => void;
    onFreeStyleSelect?: () => void;
  }) => (
    <div data-testid="learning-mode-switcher">
      <button type="button" onClick={onGuidedSelect}>
        Guided
      </button>
      <button type="button" onClick={onFreeStyleSelect}>
        Free Style
      </button>
    </div>
  ),
}));

describe("NavbarSimple", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it("shows the Elzatona-web logo text in the navbar", () => {
    render(<NavbarSimple />);

    expect(screen.getByTestId("logo")).toHaveAttribute(
      "data-show-text",
      "true",
    );
    expect(screen.getByText("Logo")).toBeInTheDocument();
  });

  it("navigates to guided learning when the switch is used", () => {
    render(<NavbarSimple />);

    fireEvent.click(
      within(screen.getAllByTestId("learning-mode-switcher")[0]).getByRole(
        "button",
        { name: "Guided" },
      ),
    );

    expect(setUserType).toHaveBeenCalledWith("guided");
    expect(push).toHaveBeenCalledWith("/features/guided-learning");
  });

  it("navigates to browse practice questions when the switch is used", () => {
    render(<NavbarSimple />);

    fireEvent.click(
      within(screen.getAllByTestId("learning-mode-switcher")[0]).getByRole(
        "button",
        { name: "Free Style" },
      ),
    );

    expect(setUserType).toHaveBeenCalledWith("self-directed");
    expect(push).toHaveBeenCalledWith("/browse-practice-questions");
  });
});
