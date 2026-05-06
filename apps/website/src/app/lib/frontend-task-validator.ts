/* eslint-disable @typescript-eslint/no-explicit-any */
// v1.1 - Enhanced solution validation system for frontend tasks
// Refactored to reduce cognitive complexity.

export interface TestCase {
  id: string;
  description: string;
  input: any;
  expectedOutput: any;
  type: "function" | "component" | "css" | "html";
  timeout?: number;
}

export interface ValidationResult {
  testCaseId: string;
  passed: boolean;
  actualOutput?: any;
  expectedOutput: any;
  error?: string;
  executionTime: number;
}

export interface SolutionValidation {
  overallPassed: boolean;
  results: ValidationResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  executionTime: number;
}

export class FrontendTaskValidator {
  private readonly timeout: number;

  constructor(timeout: number = 5000) {
    this.timeout = timeout;
  }

  async validateReactComponent(
    userCode: string,
    testCases: TestCase[],
  ): Promise<SolutionValidation> {
    return this.runValidationPipeline(testCases, async (iframe) => {
      await this.injectReactLibraries(iframe);
      await this.injectUserCode(iframe, userCode);
      return Promise.all(
        testCases.map((tc) => this.runReactTestCase(iframe, tc)),
      );
    });
  }

  async validateJavaScriptFunction(
    userCode: string,
    testCases: TestCase[],
    functionName: string,
  ): Promise<SolutionValidation> {
    return this.runValidationPipeline(testCases, async (iframe) => {
      await this.injectUserCode(iframe, userCode);
      return Promise.all(
        testCases.map((tc) =>
          this.runJavaScriptTestCase(iframe, tc, functionName),
        ),
      );
    });
  }

  async validateCSSHTML(
    userCode: string,
    testCases: TestCase[],
  ): Promise<SolutionValidation> {
    return this.runValidationPipeline(testCases, async (iframe) => {
      iframe.srcdoc = userCode;
      await new Promise((resolve) => {
        iframe.onload = resolve;
        setTimeout(resolve, 1000);
      });
      return Promise.all(
        testCases.map((tc) => this.runCSSHTMLTestCase(iframe, tc)),
      );
    });
  }

  private async runValidationPipeline(
    testCases: TestCase[],
    runner: (iframe: HTMLIFrameElement) => Promise<ValidationResult[]>,
  ): Promise<SolutionValidation> {
    const startTime = Date.now();
    let results: ValidationResult[] = [];
    let iframe: HTMLIFrameElement | null = null;

    try {
      iframe = this.createTestIframe();
      results = await runner(iframe);
    } catch (error) {
      console.error("Validation pipeline error:", error);
      results = testCases.map((tc) => ({
        testCaseId: tc.id,
        passed: false,
        expectedOutput: tc.expectedOutput,
        error: error instanceof Error ? error.message : String(error),
        executionTime: 0,
      }));
    } finally {
      iframe?.remove();
    }

    const executionTime = Date.now() - startTime;
    const passedTests = results.filter((r) => r.passed).length;
    return {
      overallPassed: passedTests === testCases.length,
      results,
      totalTests: testCases.length,
      passedTests,
      failedTests: testCases.length - passedTests,
      executionTime,
    };
  }

  private createTestIframe(): HTMLIFrameElement {
    const iframe = document.createElement("iframe");
    Object.assign(iframe.style, {
      display: "none",
      width: "0",
      height: "0",
      border: "none",
    });
    document.body.appendChild(iframe);
    return iframe;
  }

  private async injectReactLibraries(iframe: HTMLIFrameElement): Promise<void> {
    return new Promise((resolve, reject) => {
      iframe.srcdoc = `<!DOCTYPE html><html><head>
          <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        </head><body><div id="root"></div></body></html>`;
      iframe.onload = () => resolve();
      iframe.onerror = () =>
        reject(new Error("Failed to load React libraries"));
      setTimeout(
        () => reject(new Error("Timeout loading React libraries")),
        10000,
      );
    });
  }

  private async injectUserCode(
    iframe: HTMLIFrameElement,
    userCode: string,
  ): Promise<void> {
    const doc = iframe.contentDocument;
    if (!doc) throw new Error("Iframe document is not available");
    const script = doc.createElement("script");
    script.type = "text/babel";
    script.text = userCode;
    doc.head.appendChild(script);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private async runTestCase(
    testCase: TestCase,
    evaluator: () => Promise<any> | any,
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    try {
      const actualOutput = await evaluator();
      return {
        testCaseId: testCase.id,
        passed: this.compareOutputs(actualOutput, testCase.expectedOutput),
        actualOutput,
        expectedOutput: testCase.expectedOutput,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        testCaseId: testCase.id,
        passed: false,
        expectedOutput: testCase.expectedOutput,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
      };
    }
  }

  private async runReactTestCase(
    iframe: HTMLIFrameElement,
    testCase: TestCase,
  ): Promise<ValidationResult> {
    return this.runTestCase(testCase, async () => {
      const root = this.getReactRoot(iframe);
      this.renderReactComponent(iframe, root);
      return this.evaluateReactTestCase(root, testCase);
    });
  }

  private async runJavaScriptTestCase(
    iframe: HTMLIFrameElement,
    testCase: TestCase,
    functionName: string,
  ): Promise<ValidationResult> {
    return this.runTestCase(testCase, () => {
      const func = (iframe.contentWindow as any)?.[functionName];
      if (!func) throw new Error(`Function ${functionName} not found`);
      return func(testCase.input);
    });
  }

  private async runCSSHTMLTestCase(
    iframe: HTMLIFrameElement,
    testCase: TestCase,
  ): Promise<ValidationResult> {
    return this.runTestCase(testCase, () => {
      const doc = iframe.contentDocument;
      if (!doc) throw new Error("Iframe document missing");
      return this.evaluateCSSHTML(doc, testCase.input);
    });
  }

  private getReactRoot(iframe: HTMLIFrameElement): HTMLElement {
    const doc = iframe.contentDocument;
    if (!doc) throw new Error("Iframe document is not available");
    const root = doc.getElementById("root");
    if (!root) throw new Error("Root element not found");
    root.innerHTML = "";
    return root;
  }

  private renderReactComponent(
    iframe: HTMLIFrameElement,
    root: HTMLElement,
  ): void {
    const win = iframe.contentWindow as any;
    const { React, ReactDOM, Counter, TodoList } = win || {};
    if (!React || !ReactDOM) throw new Error("React libraries not loaded");
    const Component = Counter || TodoList;
    if (!Component) throw new Error("Component not found in user code");

    if (!ReactDOM.createRoot)
      throw new Error(
        "ReactDOM.createRoot not found. Ensure React 18+ is loaded.",
      );
    const reactRoot = ReactDOM.createRoot(root);
    reactRoot.render(React.createElement(Component));
  }

  private async evaluateReactTestCase(
    root: HTMLElement,
    testCase: TestCase,
  ): Promise<any> {
    await this.wait(100);
    return this._evaluateReactStep(root, testCase.input);
  }

  private async _evaluateReactStep(
    root: HTMLElement,
    input: string,
  ): Promise<string> {
    const handlers: Record<string, () => Promise<string>> = {
      initial: async () => this.textOrExpectedDigit(root, "0"),
      increment: async () => {
        await this.clickButton(root, (t) => t.includes("+"));
        return this.textOrExpectedDigit(root, "1");
      },
      decrement: async () => {
        await this.clickButton(root, (t) => t.includes("-"));
        return this.textOrExpectedDigit(root, "-1");
      },
      reset: async () => {
        await this.clickButton(root, (t) => t.toLowerCase().includes("reset"));
        return this.textOrExpectedDigit(root, "0");
      },
    };

    if (handlers[input]) {
      return handlers[input]();
    }

    return root.textContent || "";
  }

  private async clickButton(
    root: HTMLElement,
    matcher: (t: string) => boolean,
  ): Promise<void> {
    const btn = Array.from(root.querySelectorAll("button")).find((b) =>
      matcher(b.textContent || ""),
    );
    if (!btn) throw new Error("Button not found");
    btn.click();
    await this.wait(100);
  }

  private textOrExpectedDigit(root: HTMLElement, digit: string): string {
    const text = root.textContent || "";
    return text.includes(digit) ? digit : text;
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private evaluateCSSHTML(doc: Document, input: string): any {
    const handlers: Record<string, () => any> = {
      "check-grid": () => {
        const el = doc.querySelector(".card-container");
        return el ? getComputedStyle(el).display : "none";
      },
      "check-responsive": () => {
        return doc.querySelectorAll('[class*="grid"]').length > 0
          ? "responsive"
          : "not-responsive";
      },
    };

    if (handlers[input]) {
      return handlers[input]();
    }

    return doc.body.textContent || "";
  }

  private compareOutputs(actual: any, expected: any): boolean {
    if (typeof actual === "object" && typeof expected === "object")
      return JSON.stringify(actual) === JSON.stringify(expected);
    if (typeof actual === "string" && typeof expected === "string")
      return actual.trim().toLowerCase() === expected.trim().toLowerCase();
    return actual === expected;
  }
}

export const frontendTaskValidator = new FrontendTaskValidator();
