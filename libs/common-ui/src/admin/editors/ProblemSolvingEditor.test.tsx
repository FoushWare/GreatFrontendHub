import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ProblemSolvingEditor from "./ProblemSolvingEditor";
import { describe, it, expect, vi } from "vitest";

// Mock Monaco Editor
vi.mock("@monaco-editor/react", () => {
  return {
    Editor: ({ value, onChange }: any) => (
      <textarea
        data-testid="mock-editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ),
  };
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("ProblemSolvingEditor", () => {
  it("renders editor and handles save", () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();

    render(
      <ProblemSolvingEditor
        task={
          {
            id: "1",
            title: "Test",
            category: "Array",
            difficulty: "easy",
            description: "Desc",
            starterCode: "start",
            solution: "sol",
            functionName: "fn",
            testCases: [
              { id: "t1", input: ["1"], expected: "1", isHidden: false },
            ],
          } as any
        }
        onSave={onSave}
        onCancel={onCancel}
        isEditing={true}
      />,
    );

    // Initial render
    expect(screen.getByText("Edit Problem")).toBeInTheDocument();

    // Test code change via mock editor
    const mockEditor = screen.getByTestId("mock-editor");
    expect(mockEditor).toHaveValue("start"); // Default tab is starter
    fireEvent.change(mockEditor, { target: { value: "new start" } });

    // Click save
    fireEvent.click(screen.getByText("Save"));

    // Expect onSave to be called with updated starterCode
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        starterCode: "new start",
        solution: "sol",
      }),
    );
  });

  it("handles validation error without saving", () => {
    const onSave = vi.fn();

    // Create invalid state (empty title)
    render(
      <ProblemSolvingEditor
        task={
          {
            id: "1",
            title: "",
            category: "Array",
            difficulty: "easy",
            description: "",
            starterCode: "",
            solution: "",
            functionName: "",
            testCases: [],
          } as any
        }
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Save"));

    // Should fail validation and not call save
    expect(onSave).not.toHaveBeenCalled();
  });
});
