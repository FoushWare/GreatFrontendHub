/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useThemeManagement,
  useFormDataManagement,
  useCodeEditorManagement,
  useDynamicFieldsManagement,
} from "../ProblemSolvingEditorHooks";

describe("ProblemSolvingEditorHooks", () => {
  describe("useThemeManagement", () => {
    beforeEach(() => {
      vi.stubGlobal(
        "matchMedia",
        vi.fn().mockReturnValue({
          matches: false,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }),
      );
    });

    it("should initialize with default theme", () => {
      const { result } = renderHook(() => useThemeManagement());
      expect(result.current.theme).toBe("system");
    });
  });

  describe("useFormDataManagement", () => {
    it("should initialize with empty data if no task provided", () => {
      const { result } = renderHook(() => useFormDataManagement(null));
      expect(result.current.formData.title).toBe("");
    });

    it("should update form data when task is provided", () => {
      const task: any = { title: "Binary Search", difficulty: "medium" };
      const { result } = renderHook(() => useFormDataManagement(task));
      expect(result.current.formData.title).toBe("Binary Search");
      expect(result.current.formData.difficulty).toBe("medium");
    });
  });

  describe("useCodeEditorManagement", () => {
    it("should initialize with default starter code if no task", () => {
      const { result } = renderHook(() => useCodeEditorManagement(null));
      expect(result.current.starterCode).toContain("function solution");
    });

    it("should use task code if provided", () => {
      const task: any = {
        starterCode: "// Start here",
        solution: "// Solution here",
      };
      const { result } = renderHook(() => useCodeEditorManagement(task));
      expect(result.current.starterCode).toBe("// Start here");
      expect(result.current.solutionCode).toBe("// Solution here");
    });
  });

  describe("useDynamicFieldsManagement", () => {
    it("should manage dynamic strings", () => {
      const { result } = renderHook(() => useDynamicFieldsManagement());

      act(() => {
        result.current.setNewConstraint("O(n)");
      });
      expect(result.current.newConstraint).toBe("O(n)");
    });
  });
});
