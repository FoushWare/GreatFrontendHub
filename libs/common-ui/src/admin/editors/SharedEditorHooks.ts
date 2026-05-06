import { useState, useEffect, useCallback } from "react";

/**
 * Shared hook for theme management across editors
 */
export const useThemeManagement = () => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mediaQuery = globalThis.window.matchMedia(
      "(prefers-color-scheme: dark)",
    );
    const updateTheme = () => {
      if (theme === "system") {
        setIsDark(mediaQuery.matches);
      } else {
        setIsDark(theme === "dark");
      }
    };

    updateTheme();
    mediaQuery.addEventListener("change", updateTheme);
    return () => mediaQuery.removeEventListener("change", updateTheme);
  }, [theme]);

  return { theme, setTheme, isDark };
};

/**
 * Shared hook for panel layout management (horizontal resizing)
 */
export const usePanelLayout = (initialLeft = 25, initialRight = 25) => {
  const [leftPanelWidth, setLeftPanelWidth] = useState(initialLeft);
  const [rightPanelWidth, setRightPanelWidth] = useState(initialRight);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeStartX(e.clientX);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - resizeStartX;
      const containerWidth = window.innerWidth;
      const deltaPercent = (deltaX / containerWidth) * 100;

      if (deltaPercent !== 0) {
        setLeftPanelWidth((prev) =>
          Math.max(15, Math.min(60, prev + deltaPercent)),
        );
        setRightPanelWidth((prev) =>
          Math.max(15, Math.min(60, prev - deltaPercent)),
        );
        setResizeStartX(e.clientX);
      }
    },
    [isResizing, resizeStartX],
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return {
    leftPanelWidth,
    rightPanelWidth,
    setLeftPanelWidth,
    setRightPanelWidth,
    handleMouseDown,
  };
};

/**
 * Shared hook for console message management
 */
export const useConsoleManagement = (maxLogs = 20) => {
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [showConsole, setShowConsole] = useState(true);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== globalThis.window.location.origin) return;
      if (event.data.type === "console") {
        setConsoleOutput((prev) => [
          ...prev.slice(-(maxLogs - 1)),
          event.data.message,
        ]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [maxLogs]);

  return { consoleOutput, setConsoleOutput, showConsole, setShowConsole };
};
