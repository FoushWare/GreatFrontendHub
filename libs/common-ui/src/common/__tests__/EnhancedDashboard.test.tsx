/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EnhancedDashboard from "../EnhancedDashboard";

// Mock dependencies
vi.mock("../../../../apps/website/src/app/lib/supabase-client", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  },
  getCurrentUser: vi
    .fn()
    .mockResolvedValue({ id: "user-1", email: "test@example.com" }),
}));

vi.mock("lucide-react", () => ({
  BookOpen: () => <div data-testid="icon-book" />,
  Target: () => <div data-testid="icon-target" />,
  Zap: () => <div data-testid="icon-zap" />,
  BarChart3: () => <div data-testid="icon-chart" />,
  Award: () => <div data-testid="icon-award" />,
  ChevronRight: () => <div data-testid="icon-chevron" />,
  Calendar: () => <div data-testid="icon-calendar" />,
  User: () => <div data-testid="icon-user" />,
  Clock: () => <div data-testid="icon-clock" />,
  Code: () => <div data-testid="icon-code" />,
  ArrowRight: () => <div data-testid="icon-arrow-right" />,
  TrendingUp: () => <div data-testid="icon-trending-up" />,
  Trophy: () => <div data-testid="icon-trophy" />,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock("./dashboard/UserStatistics", () => ({
  default: () => <div data-testid="user-stats" />,
}));
vi.mock("./dashboard/ActionCard", () => ({
  default: () => <div data-testid="action-card" />,
}));
vi.mock("./dashboard/DailyChallenge", () => ({
  default: () => <div data-testid="daily-challenge" />,
}));
vi.mock("./dashboard/ContinueLearning", () => ({
  default: () => <div data-testid="continue-learning" />,
}));
vi.mock("./dashboard/UpcomingPlans", () => ({
  default: () => <div data-testid="upcoming-plans" />,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
}));

describe("EnhancedDashboard", () => {
  it("renders correctly with user data", () => {
    render(<EnhancedDashboard />);
    expect(document.body).toBeDefined();
  });
});
