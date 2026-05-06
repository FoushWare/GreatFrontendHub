/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  useThemeManagement,
  useFormDataManagement,
  usePanelLayout,
  useConsoleManagement,
} from "../FrontendTaskEditorHooks";

describe("FrontendTaskEditorHooks", () => {
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

    it("should update isDark when theme changes", () => {
      const { result } = renderHook(() => useThemeManagement());

      act(() => {
        result.current.setTheme("dark");
      });
      expect(result.current.isDark).toBe(true);

      act(() => {
        result.current.setTheme("light");
      });
      expect(result.current.isDark).toBe(false);
    });
  });

  describe("useFormDataManagement", () => {
    it("should initialize with empty data if no task provided", () => {
      const { result } = renderHook(() => useFormDataManagement(null));
      expect(result.current.formData.title).toBe("");
    });

    it("should initialize with task data if provided", () => {
      const task: any = { title: "Test Task", difficulty: "intermediate" };
      const { result } = renderHook(() => useFormDataManagement(task));
      expect(result.current.formData.title).toBe("Test Task");
      expect(result.current.formData.difficulty).toBe("intermediate");
    });
  });

  describe("usePanelLayout", () => {
    it("should initialize with default widths", () => {
      const { result } = renderHook(() => usePanelLayout());
      expect(result.current.leftPanelWidth).toBe(25);
      expect(result.current.rightPanelWidth).toBe(25);
    });
  });

  describe("useConsoleManagement", () => {
    it("should initialize with empty console output", () => {
      const { result } = renderHook(() => useConsoleManagement());
      expect(result.current.consoleOutput).toEqual([]);
    });

    it("should add messages to console output on message event", () => {
      const { result } = renderHook(() => useConsoleManagement());

      act(() => {
        const event = new MessageEvent("message", {
          data: { type: "console", message: "test log" },
          origin: window.location.origin,
        });
        window.dispatchEvent(event);
      });

      expect(result.current.consoleOutput).toContain("test log");
    });
  });
});
