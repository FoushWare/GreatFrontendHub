import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useThemeManagement,
  usePanelLayout,
  useConsoleManagement,
} from "./SharedEditorHooks";

// Mock matchMedia
Object.defineProperty(globalThis.window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("SharedEditorHooks", () => {
  describe("useThemeManagement", () => {
    it("should initialize with default 'system' theme", () => {
      const { result } = renderHook(() => useThemeManagement());
      expect(result.current.theme).toBe("system");
      expect(result.current.isDark).toBe(false);
    });

    it("should update isDark when theme changes to dark", () => {
      const { result } = renderHook(() => useThemeManagement());
      act(() => {
        result.current.setTheme("dark");
      });
      expect(result.current.isDark).toBe(true);
    });
  });

  describe("usePanelLayout", () => {
    it("should initialize with provided widths", () => {
      const { result } = renderHook(() => usePanelLayout(30, 40));
      expect(result.current.leftPanelWidth).toBe(30);
      expect(result.current.rightPanelWidth).toBe(40);
    });

    it("should handle resizing correctly", () => {
      const { result } = renderHook(() => usePanelLayout(25, 25));

      act(() => {
        const event = { clientX: 100, preventDefault: vi.fn() } as any;
        result.current.handleMouseDown(event);
      });

      // Mock mouse move
      act(() => {
        const moveEvent = new MouseEvent("mousemove", { clientX: 200 });
        document.dispatchEvent(moveEvent);
      });

      // Since we can't easily mock window.innerWidth in this environment to get exact percents,
      // we check that widths changed
      expect(result.current.leftPanelWidth).not.toBe(25);
    });
  });

  describe("useConsoleManagement", () => {
    it("should initialize with empty logs", () => {
      const { result } = renderHook(() => useConsoleManagement());
      expect(result.current.consoleOutput).toEqual([]);
    });

    it("should capture console messages from same origin", () => {
      const { result } = renderHook(() => useConsoleManagement());

      act(() => {
        window.dispatchEvent(
          new MessageEvent("message", {
            origin: window.location.origin,
            data: { type: "console", message: "Test log" },
          }),
        );
      });

      expect(result.current.consoleOutput).toEqual(["Test log"]);
    });
  });
});
