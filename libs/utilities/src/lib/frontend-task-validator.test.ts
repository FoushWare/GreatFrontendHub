import {
  FrontendTaskValidator,
  frontendTaskValidator,
} from "./frontend-task-validator";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

describe("FrontendTaskValidator", () => {
  let validator: FrontendTaskValidator;

  beforeEach(() => {
    validator = new FrontendTaskValidator();

    // Mock DOM elements and document methods
    const mockIframe = {
      style: {},
      contentDocument: {
        open: vi.fn(),
        write: vi.fn(),
        close: vi.fn(),
        createElement: vi.fn().mockImplementation((tag) => {
          if (tag === "script") return { type: "", text: "" };
          return {};
        }),
        head: { appendChild: vi.fn() },
        getElementById: vi.fn().mockReturnValue({
          innerHTML: "",
          textContent: "0",
          querySelectorAll: vi.fn().mockReturnValue([]),
        }),
      },
      contentWindow: {
        React: { createElement: vi.fn() },
        ReactDOM: { createRoot: vi.fn().mockReturnValue({ render: vi.fn() }) },
        Counter: vi.fn(), // mock component
      },
      onload: null as any,
      remove: vi.fn(),
    };

    vi.spyOn(document, "createElement").mockReturnValue(mockIframe as any);
    vi.spyOn(document.body, "appendChild").mockImplementation(
      () => null as any,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should validate a JavaScript function", async () => {
    const testCases = [
      {
        id: "1",
        description: "Test 1",
        input: 1,
        expectedOutput: 2,
        type: "function" as const,
      },
    ];

    const result = await validator.validateJavaScriptFunction(
      "code",
      testCases,
      "myFunc",
    );
    // Implementation currently always returns passed=false because it's a stub
    expect(result.overallPassed).toBe(false);
    expect(result.totalTests).toBe(1);
    expect(result.results.length).toBe(0); // the current stub doesn't push results
  });

  it("should validate a React component successfully", async () => {
    const testCases = [
      {
        id: "1",
        description: "Test 1",
        input: "initial",
        expectedOutput: "0",
        type: "component" as const,
      },
    ];

    // Simulate iframe load
    setTimeout(() => {
      const iframe = (document.createElement as any).mock.results[0].value;
      if (iframe.onload) iframe.onload();
    }, 10);

    const promise = validator.validateReactComponent(
      "const App = () => <div/>;",
      testCases,
    );

    const result = await promise;
    expect(result.totalTests).toBe(1);
    expect(result.overallPassed).toBe(true);
    expect(result.results[0].passed).toBe(true);
  });

  it("should handle React load timeout error", async () => {
    const testCases = [
      {
        id: "1",
        description: "Test 1",
        input: "initial",
        expectedOutput: "0",
        type: "component" as const,
      },
    ];

    vi.useFakeTimers();
    const promise = validator.validateReactComponent(
      "const App = () => <div/>;",
      testCases,
    );
    vi.runAllTimers(); // Advance to trigger timeout
    const result = await promise;
    vi.useRealTimers();

    expect(result.overallPassed).toBe(false);
    expect(result.results[0].error).toBe("React load timeout");
  });

  it("should export a default instance", () => {
    expect(frontendTaskValidator).toBeInstanceOf(FrontendTaskValidator);
  });
});
