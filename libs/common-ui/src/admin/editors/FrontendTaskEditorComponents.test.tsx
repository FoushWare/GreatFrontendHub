import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  FrontendTaskEditorHeader,
  FrontendTaskEditorMainContent,
} from "./FrontendTaskEditorComponents";
import { describe, it, expect, vi } from "vitest";

describe("FrontendTaskEditorComponents", () => {
  describe("FrontendTaskEditorHeader", () => {
    it("renders create mode and handles cancel", () => {
      const onCancel = vi.fn();
      render(
        <FrontendTaskEditorHeader
          isDark={false}
          theme="light"
          setTheme={vi.fn()}
          mode="create"
          formData={{ difficulty: "Easy" }}
          handleSave={vi.fn()}
          onCancel={onCancel}
        />,
      );
      expect(screen.getByText("Create Task")).toBeInTheDocument();
      const cancelButtons = screen
        .getAllByRole("button")
        .filter(
          (b) =>
            b.textContent === "Cancel" || b.innerHTML.includes("ArrowLeft"),
        );
      fireEvent.click(cancelButtons[0]);
      expect(onCancel).toHaveBeenCalled();
    });

    it("renders edit mode and handles save", () => {
      const onSave = vi.fn();
      render(
        <FrontendTaskEditorHeader
          isDark={true}
          theme="dark"
          setTheme={vi.fn()}
          mode="edit"
          formData={{ difficulty: "Hard" }}
          handleSave={onSave}
          onCancel={vi.fn()}
        />,
      );
      expect(screen.getByText("Edit Task")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Save"));
      expect(onSave).toHaveBeenCalled();
    });
  });

  describe("FrontendTaskEditorMainContent", () => {
    it("renders and handles tab changes", () => {
      const setActiveTab = vi.fn();
      const setFormData = vi.fn();

      render(
        <FrontendTaskEditorMainContent
          isDark={false}
          leftPanelWidth={30}
          rightPanelWidth={30}
          handleMouseDown={vi.fn()}
          activeTab="description"
          setActiveTab={setActiveTab}
          formData={{ title: "Test" }}
          setFormData={setFormData}
          mode="create"
          showFileExplorer={false}
          setShowFileExplorer={vi.fn()}
        />,
      );

      const titleInput = screen.getByDisplayValue("Test");
      expect(titleInput).toBeInTheDocument();
      fireEvent.change(titleInput, { target: { value: "New Title" } });
      expect(setFormData).toHaveBeenCalledWith({ title: "New Title" });
    });
  });
});
