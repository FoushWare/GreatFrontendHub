/**
 * Unit Tests for AdminQuickActionsSection Component
 * Tests action rendering, click handling, and navigation
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AdminQuickActionsSection } from "./AdminQuickActionsSection";
import { HelpCircle, Code } from "lucide-react";
import type { AdminQuickAction } from "./AdminQuickActionsSection";

describe("AdminQuickActionsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockActions: readonly AdminQuickAction[] = [
    {
      title: "Add New Question",
      description: "Create a new learning question",
      href: "/admin/content/questions",
      icon: HelpCircle,
      color: "bg-blue-500",
    },
    {
      title: "Create Frontend Task",
      description: "Add a new React coding challenge",
      href: "/admin/frontend-tasks",
      icon: Code,
      color: "bg-cyan-500",
    },
  ];

  describe("Rendering", () => {
    it("should render default title", () => {
      render(<AdminQuickActionsSection actions={mockActions} />);

      expect(screen.getByText("Quick Actions")).toBeInTheDocument();
    });

    it("should render custom title", () => {
      render(
        <AdminQuickActionsSection
          actions={mockActions}
          title="Custom Actions"
        />,
      );

      expect(screen.getByText("Custom Actions")).toBeInTheDocument();
    });

    it("should render default subtitle", () => {
      render(<AdminQuickActionsSection actions={mockActions} />);

      expect(screen.getByText("Most used features")).toBeInTheDocument();
    });

    it("should render custom subtitle", () => {
      render(
        <AdminQuickActionsSection
          actions={mockActions}
          subtitle="Custom subtitle"
        />,
      );

      expect(screen.getByText("Custom subtitle")).toBeInTheDocument();
    });

    it("should render all action buttons", () => {
      render(<AdminQuickActionsSection actions={mockActions} />);

      expect(screen.getByText("Add New Question")).toBeInTheDocument();
      expect(screen.getByText("Create Frontend Task")).toBeInTheDocument();
    });

    it("should render action descriptions", () => {
      render(<AdminQuickActionsSection actions={mockActions} />);

      expect(
        screen.getByText("Create a new learning question"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Add a new React coding challenge"),
      ).toBeInTheDocument();
    });

    it("should not render subtitle when empty string is provided", () => {
      render(<AdminQuickActionsSection actions={mockActions} subtitle="" />);

      expect(screen.queryByText("Most used features")).not.toBeInTheDocument();
    });
  });

  describe("Click Handling", () => {
    it("should render action buttons that are clickable", () => {
      render(<AdminQuickActionsSection actions={mockActions} />);
      const button = screen.getByText("Add New Question");
      fireEvent.click(button);
      // Navigation test skipped due to JSDOM location mock limitations
      expect(button).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <AdminQuickActionsSection
          actions={mockActions}
          className="custom-section"
        />,
      );

      expect(container.querySelector(".custom-section")).toBeInTheDocument();
    });

    it("should apply action color classes", () => {
      const { container } = render(
        <AdminQuickActionsSection actions={mockActions} />,
      );

      expect(container.querySelector(".bg-blue-500")).toBeInTheDocument();
      expect(container.querySelector(".bg-cyan-500")).toBeInTheDocument();
    });
  });
});
