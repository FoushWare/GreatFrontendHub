import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ProblemSolvingEditorHeader,
  ProblemSolvingEditorMainContent,
} from "./ProblemSolvingEditorComponents";
import { describe, it, expect, vi } from "vitest";

describe("ProblemSolvingEditorComponents", () => {
  describe("ProblemSolvingEditorHeader", () => {
    it("renders and handles save and cancel", () => {
      const onSave = vi.fn();
      const onCancel = vi.fn();

      render(
        <ProblemSolvingEditorHeader
          isDark={false}
          theme="light"
          setTheme={vi.fn()}
          isEditing={true}
          formData={{ category: "Array", difficulty: "medium" } as any}
          handleSave={onSave}
          onCancel={onCancel}
        />,
      );

      expect(screen.getByText("Edit Problem")).toBeInTheDocument();
      expect(screen.getByText("Array")).toBeInTheDocument();
      expect(screen.getByText("medium")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Save"));
      expect(onSave).toHaveBeenCalled();

      const cancelButtons = screen.getAllByRole("button");
      fireEvent.click(cancelButtons[0]);
      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe("ProblemSolvingEditorMainContent", () => {
    it("renders and handles inputs and tab changes", () => {
      const setActiveTab = vi.fn();
      const setFormData = vi.fn();

      render(
        <ProblemSolvingEditorMainContent
          isDark={true}
          leftPanelWidth={30}
          rightPanelWidth={30}
          handleMouseDown={vi.fn()}
          activeTab="starter"
          setActiveTab={setActiveTab}
          formData={
            {
              title: "Test Title",
              description: "Desc",
              category: "Array",
              difficulty: "easy",
              functionName: "testFn",
            } as any
          }
          setFormData={setFormData}
        />,
      );

      expect(screen.getByDisplayValue("Test Title")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Desc")).toBeInTheDocument();

      fireEvent.change(screen.getByDisplayValue("Test Title"), {
        target: { value: "New" },
      });
      expect(setFormData).toHaveBeenCalledWith(
        expect.objectContaining({ title: "New" }),
      );

      fireEvent.click(screen.getByText("solution Code"));
      expect(setActiveTab).toHaveBeenCalledWith("solution");
    });
  });
});
